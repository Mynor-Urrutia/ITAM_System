// itam_frontend/src/pages/employees/EmployeeFormModal.js

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import EmployeeSearchModal from '../../components/EmployeeSearchModal';
import {
    createEmployee, updateEmployee,
    getRegions, getFincas, getDepartamentos, getAreas, getEmployees
} from '../../api';
import api from '../../api';
import { toast } from 'react-toastify';

const EmployeeFormModal = ({ show, onClose, onSaveSuccess, employeeToEdit }) => {
    const [formData, setFormData] = useState({
        employee_number: '',
        first_name: '',
        last_name: '',
        department: '',
        area: '',
        region: '',
        finca: '',
        start_date: '',
        supervisor: '',
        document: null,
    });

    const [options, setOptions] = useState({
        regions: [],
        fincas: [],
        departamentos: [],
        areas: [],
    });

    const [filteredOptions, setFilteredOptions] = useState({
        fincas: [],
        areas: [],
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSupervisorModal, setShowSupervisorModal] = useState(false);
    const [supervisorName, setSupervisorName] = useState('');

    useEffect(() => {
        if (show) {
            fetchOptions();
        }
    }, [show]);

    // Reset form when opening for create
    useEffect(() => {
        if (show && !employeeToEdit) {
            setFormData({
                employee_number: '',
                first_name: '',
                last_name: '',
                department: '',
                area: '',
                region: '',
                finca: '',
                start_date: '',
                supervisor: '',
                document: null,
            });
        }
    }, [show, employeeToEdit]);

    useEffect(() => {
        if (employeeToEdit) {
            setFormData({
                employee_number: employeeToEdit.employee_number || '',
                first_name: employeeToEdit.first_name || '',
                last_name: employeeToEdit.last_name || '',
                department: employeeToEdit.department_id || '',
                area: employeeToEdit.area_id || '',
                region: employeeToEdit.region_id || '',
                finca: employeeToEdit.finca_id || '',
                start_date: employeeToEdit.start_date || '',
                supervisor: employeeToEdit.supervisor_id || '',
                document: null, // File inputs can't be pre-filled
            });
            // Load supervisor name if exists
            if (employeeToEdit.supervisor_id) {
                loadSupervisorName(employeeToEdit.supervisor_id);
            } else {
                setSupervisorName('');
            }
        } else {
            setFormData({
                employee_number: '',
                first_name: '',
                last_name: '',
                department: '',
                area: '',
                region: '',
                finca: '',
                start_date: '',
                supervisor: '',
                document: null,
            });
            setSupervisorName('');
        }
    }, [employeeToEdit]);

    // Filter fincas when region changes
    useEffect(() => {
        if (formData.region) {
            const filtered = options.fincas.filter(finca => finca.region === parseInt(formData.region));
            setFilteredOptions(prev => ({ ...prev, fincas: filtered }));
        } else {
            setFilteredOptions(prev => ({ ...prev, fincas: [] }));
        }
    }, [formData.region, options.fincas]);

    // Filter areas when departamento changes
    useEffect(() => {
        if (formData.department) {
            const filtered = options.areas.filter(area => area.departamento_id === parseInt(formData.department));
            setFilteredOptions(prev => ({ ...prev, areas: filtered }));
        } else {
            setFilteredOptions(prev => ({ ...prev, areas: [] }));
        }
    }, [formData.department, options.areas]);

    const fetchOptions = async () => {
        try {
            const [
                regionsRes, fincasRes, deptosRes, areasRes
            ] = await Promise.all([
                getRegions({ page_size: 1000 }),
                getFincas({ page_size: 1000 }),
                getDepartamentos({ page_size: 1000 }),
                getAreas({ page_size: 1000 }),
            ]);

            setOptions({
                regions: regionsRes.data.results || regionsRes.data || [],
                fincas: fincasRes.data.results || fincasRes.data || [],
                departamentos: deptosRes.data.results || deptosRes.data || [],
                areas: areasRes.data.results || areasRes.data || [],
            });
        } catch (error) {
            console.error('Error fetching options:', error);
            toast.error('Error al cargar las opciones del formulario.');
        }
    };

    const loadSupervisorName = async (supervisorId) => {
        try {
            const response = await api.get(`employees/employees/${supervisorId}/`);
            const supervisor = response.data;
            if (supervisor) {
                setSupervisorName(`${supervisor.employee_number} - ${supervisor.first_name} ${supervisor.last_name}`);
            }
        } catch (error) {
            console.error('Error loading supervisor name:', error);
            setSupervisorName('Error al cargar nombre');
        }
    };

    const handleSupervisorSelect = (employee) => {
        setFormData(prev => ({ ...prev, supervisor: employee.id }));
        setSupervisorName(`${employee.employee_number} - ${employee.first_name} ${employee.last_name}`);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear errors
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.employee_number) newErrors.employee_number = 'No. Empleado es obligatorio.';
        if (!formData.first_name) newErrors.first_name = 'Nombres es obligatorio.';
        if (!formData.last_name) newErrors.last_name = 'Apellidos es obligatorio.';
        if (!formData.start_date) newErrors.start_date = 'Inicio de Labores es obligatorio.';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const findErrors = validate();
        if (Object.keys(findErrors).length > 0) {
            setErrors(findErrors);
            return;
        }

        setLoading(true);
        try {
            let submitData;
            let config = {};

            // Check if we have a file to upload
            const hasFile = formData.document && formData.document instanceof File;

            if (hasFile) {
                // Use FormData for file uploads
                submitData = new FormData();
                config.headers = { 'Content-Type': 'multipart/form-data' };

                // Add basic fields
                submitData.append('employee_number', formData.employee_number);
                submitData.append('first_name', formData.first_name);
                submitData.append('last_name', formData.last_name);
                submitData.append('start_date', formData.start_date);

                // Handle optional fields - convert empty strings to null
                if (formData.department && formData.department !== '') {
                    submitData.append('department', formData.department);
                }
                if (formData.area && formData.area !== '') {
                    submitData.append('area', formData.area);
                }
                if (formData.region && formData.region !== '') {
                    submitData.append('region', formData.region);
                }
                if (formData.finca && formData.finca !== '') {
                    submitData.append('finca', formData.finca);
                }
                if (formData.supervisor && formData.supervisor !== '') {
                    submitData.append('supervisor', formData.supervisor);
                }

                // Handle file upload
                submitData.append('document', formData.document);
            } else {
                // Use regular JSON object for non-file updates
                submitData = {
                    employee_number: formData.employee_number,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    start_date: formData.start_date,
                };

                // Handle optional fields - convert empty strings to null
                if (formData.department && formData.department !== '') {
                    submitData.department = formData.department;
                }
                if (formData.area && formData.area !== '') {
                    submitData.area = formData.area;
                }
                if (formData.region && formData.region !== '') {
                    submitData.region = formData.region;
                }
                if (formData.finca && formData.finca !== '') {
                    submitData.finca = formData.finca;
                }
                if (formData.supervisor && formData.supervisor !== '') {
                    submitData.supervisor = formData.supervisor;
                }
                // Don't include document field if no file
            }

            if (employeeToEdit) {
                await updateEmployee(employeeToEdit.id, submitData, config);
                toast.success('Empleado actualizado exitosamente!');
            } else {
                await createEmployee(submitData, config);
                toast.success('Empleado creado exitosamente!');
            }
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving employee:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.detail || 'Error al guardar el empleado.';
            toast.error(errorMsg);
            setErrors(error.response?.data || {});
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while fetching options
    if (!options.regions || options.regions.length === 0) {
        return (
            <Modal show={show} onClose={onClose} title={employeeToEdit ? "Editar Empleado" : "Crear Empleado"} size="large">
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500">Cargando opciones...</div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal show={show} onClose={onClose} title={employeeToEdit ? "Editar Empleado" : "Crear Empleado"} size="xl">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información Personal */}
                <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>
                    <div className="grid grid-cols-3 gap-6">
                        {/* No. Empleado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">No. Empleado *</label>
                            <input
                                type="text"
                                name="employee_number"
                                value={formData.employee_number}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {errors.employee_number && <p className="mt-1 text-sm text-red-600">{errors.employee_number}</p>}
                        </div>

                        {/* Nombres */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombres *</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
                        </div>

                        {/* Apellidos */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos *</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
                        </div>
                    </div>
                </div>

                {/* Información Organizacional */}
                <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Organizacional</h3>
                    <div className="grid grid-cols-3 gap-6">
                        {/* Departamento */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            >
                                <option value="">Seleccionar...</option>
                                {options.departamentos && options.departamentos.map(depto => (
                                    <option key={depto.id} value={depto.id}>{depto.name}</option>
                                ))}
                            </select>
                            {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
                        </div>

                        {/* Área */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Área</label>
                            <select
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                disabled={!formData.department}
                            >
                                <option value="">
                                    {formData.department ? 'Seleccionar...' : 'Seleccione Departamento primero'}
                                </option>
                                {filteredOptions.areas && filteredOptions.areas.map(area => (
                                    <option key={area.id} value={area.id}>{area.name}</option>
                                ))}
                            </select>
                            {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
                        </div>

                        {/* Región */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Región</label>
                            <select
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            >
                                <option value="">Seleccionar...</option>
                                {options.regions && options.regions.map(region => (
                                    <option key={region.id} value={region.id}>{region.name}</option>
                                ))}
                            </select>
                            {errors.region && <p className="mt-1 text-sm text-red-600">{errors.region}</p>}
                        </div>

                        {/* Finca */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Finca</label>
                            <select
                                name="finca"
                                value={formData.finca}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                disabled={!formData.region}
                            >
                                <option value="">
                                    {formData.region ? 'Seleccionar...' : 'Seleccione Región primero'}
                                </option>
                                {filteredOptions.fincas && filteredOptions.fincas.map(finca => (
                                    <option key={finca.id} value={finca.id}>{finca.name}</option>
                                ))}
                            </select>
                            {errors.finca && <p className="mt-1 text-sm text-red-600">{errors.finca}</p>}
                        </div>

                        {/* Inicio de Labores */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Inicio de Labores *</label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                        </div>

                        {/* Jefe Inmediato */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jefe Inmediato</label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={supervisorName}
                                    readOnly
                                    placeholder="Seleccione un jefe inmediato..."
                                    className="flex-1 block w-full rounded-md bg-gray-50 border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSupervisorModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Buscar
                                </button>
                            </div>
                            {errors.supervisor && <p className="mt-1 text-sm text-red-600">{errors.supervisor}</p>}
                        </div>

                        {/* Documento PDF */}
                        <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Documento PDF</label>
                            <input
                                type="file"
                                name="document"
                                accept=".pdf"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setFormData(prev => ({ ...prev, document: file }));
                                }}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            <p className="mt-1 text-sm text-gray-500">Seleccione un archivo PDF (opcional)</p>
                            {errors.document && <p className="mt-1 text-sm text-red-600">{errors.document}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>

            {/* Employee Search Modal */}
            <EmployeeSearchModal
                show={showSupervisorModal}
                onClose={() => setShowSupervisorModal(false)}
                onSelect={handleSupervisorSelect}
            />
        </Modal>
    );
};

export default EmployeeFormModal;