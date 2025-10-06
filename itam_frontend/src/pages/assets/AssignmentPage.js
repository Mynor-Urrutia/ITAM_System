// itam_frontend/src/pages/assets/AssignmentPage.js

import React, { useState, useEffect } from 'react';
import { getEmployees, getAssignments, bulkAssignAssets, returnAssignment } from '../../api';
import api from '../../api';
import EmployeeAutocomplete from '../../components/EmployeeAutocomplete';
import AssignmentModal from './AssignmentModal';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUndo, faEye, faEdit, faCheck, faTimes, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

function AssignmentPage() {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [currentAssignments, setCurrentAssignments] = useState([]);
    const [allAssignments, setAllAssignments] = useState([]);
    const [groupedAssignments, setGroupedAssignments] = useState([]);
    const [allAssignmentsPage, setAllAssignmentsPage] = useState(1);
    const [allAssignmentsPageSize, setAllAssignmentsPageSize] = useState(10);
    const [allAssignmentsTotalCount, setAllAssignmentsTotalCount] = useState(0);
    const [allAssignmentsTotalPages, setAllAssignmentsTotalPages] = useState(0);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [assignmentToReturn, setAssignmentToReturn] = useState(null);
    const [returnDate, setReturnDate] = useState('');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [assignmentToView, setAssignmentToView] = useState(null);
    const [isUnassignAllModalOpen, setIsUnassignAllModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedCards, setExpandedCards] = useState(new Set());
    const [expandedGroups, setExpandedGroups] = useState(new Set());

    const { hasPermission } = useAuth();
    const canAssignAssets = hasPermission('assets.add_assignment');
    const canReturnAssets = hasPermission('assets.change_assignment');

    // Fetch all assignments on mount and page changes
    useEffect(() => {
        fetchAllAssignments(allAssignmentsPage, allAssignmentsPageSize);
    }, [allAssignmentsPage, allAssignmentsPageSize]);

    useEffect(() => {
        // Group assignments by employee
        const grouped = allAssignments.reduce((acc, assignment) => {
            const employeeId = assignment.employee;
            if (!acc[employeeId]) {
                acc[employeeId] = {
                    employee_id: employeeId,
                    employee_name: assignment.employee_name,
                    employee_number: assignment.employee_number,
                    assignments: [],
                    assigned_by: assignment.assigned_by_name, // Use the first one, or most recent
                    latest_date: assignment.assigned_date
                };
            }
            acc[employeeId].assignments.push(assignment);
            // Update latest date
            if (new Date(assignment.assigned_date) > new Date(acc[employeeId].latest_date)) {
                acc[employeeId].latest_date = assignment.assigned_date;
                acc[employeeId].assigned_by = assignment.assigned_by_name;
            }
            return acc;
        }, {});
        setGroupedAssignments(Object.values(grouped));
    }, [allAssignments]);

    // Fetch employee data when ID changes
    useEffect(() => {
        const fetchEmployeeData = async () => {
            if (selectedEmployeeId) {
                try {
                    // Get single employee by ID
                    const response = await api.get(`employees/employees/${selectedEmployeeId}/`);
                    setSelectedEmployee(response.data);
                } catch (error) {
                    console.error('Error fetching employee data:', error);
                    toast.error('Error al cargar datos del empleado.');
                    setSelectedEmployee(null);
                }
            } else {
                setSelectedEmployee(null);
            }
        };

        fetchEmployeeData();
    }, [selectedEmployeeId]);

    useEffect(() => {
        if (selectedEmployee) {
            fetchCurrentAssignments();
        }
    }, [selectedEmployee]);

    const fetchAllAssignments = async (page = 1, size = 10) => {
        try {
            const params = {
                page,
                page_size: size,
                active_only: true
            };
            const response = await getAssignments(params);
            setAllAssignments(response.data.results || response.data);
            setAllAssignmentsTotalCount(response.data.count || (response.data.results || response.data).length);
            setAllAssignmentsTotalPages(Math.ceil((response.data.count || (response.data.results || response.data).length) / size));
        } catch (error) {
            console.error('Error fetching all assignments:', error);
            toast.error('Error al cargar las asignaciones.');
        }
    };

    const fetchCurrentAssignments = async () => {
        if (!selectedEmployee) return;

        try {
            const params = {
                employee: selectedEmployee.id,
                active_only: true
            };
            const response = await getAssignments(params);
            setCurrentAssignments(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching current assignments:', error);
            toast.error('Error al cargar las asignaciones actuales.');
        }
    };


    const handleEmployeeChange = (e) => {
        setSelectedEmployeeId(e.target.value);
    };


    const handleAllAssignmentsPageChange = (page) => {
        setAllAssignmentsPage(page);
    };

    const handleAllAssignmentsPageSizeChange = (size) => {
        setAllAssignmentsPageSize(size);
        setAllAssignmentsPage(1);
    };

    const handleAssignmentSuccess = () => {
        setIsAssignModalOpen(false);
        fetchCurrentAssignments();
        fetchAllAssignments(allAssignmentsPage, allAssignmentsPageSize);
    };

    const handleReturnClick = (assignment) => {
        setAssignmentToReturn(assignment);
        setReturnDate(new Date().toISOString().split('T')[0]); // Today's date
        setIsReturnModalOpen(true);
    };

    const handleViewClick = (assignment) => {
        setAssignmentToView(assignment);
        setIsViewModalOpen(true);
    };

    const handleUnassignAllClick = () => {
        setIsUnassignAllModalOpen(true);
    };

    const handleUnassignAllForEmployee = async (assignments) => {
        setLoading(true);
        try {
            const returnPromises = assignments.map(assignment =>
                returnAssignment(assignment.id, { return_date: new Date().toISOString().split('T')[0] })
            );
            await Promise.all(returnPromises);
            toast.success('Todos los activos del empleado han sido desasignados.');
            fetchAllAssignments(allAssignmentsPage, allAssignmentsPageSize);
            if (selectedEmployee) {
                fetchCurrentAssignments();
            }
        } catch (error) {
            console.error('Error unassigning all assets for employee:', error);
            toast.error('Error al desasignar los activos.');
        } finally {
            setLoading(false);
        }
    };

    const handleReturnConfirm = async () => {
        if (!returnDate) {
            toast.warning('Selecciona una fecha de devolución.');
            return;
        }

        setLoading(true);
        try {
            await returnAssignment(assignmentToReturn.id, { return_date: returnDate });
            toast.success('Activo devuelto correctamente.');
            setIsReturnModalOpen(false);
            setAssignmentToReturn(null);
            setReturnDate('');
            fetchCurrentAssignments();
            fetchAllAssignments(allAssignmentsPage, allAssignmentsPageSize);
        } catch (error) {
            console.error('Error returning asset:', error);
            toast.error('Error al devolver el activo.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-2 sm:p-4 relative min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Asignación de Activos
                    </h1>
                    {selectedEmployee && canAssignAssets && (
                        <button
                            onClick={() => setIsAssignModalOpen(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Asignar Activos
                        </button>
                    )}
                </div>
            </div>

            {/* Employee Selection */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Empleado
                </label>
                <EmployeeAutocomplete
                    name="employee"
                    value={selectedEmployeeId}
                    onChange={handleEmployeeChange}
                    placeholder="Buscar empleado por nombre o número..."
                />
                {selectedEmployee && (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                        <p className="text-sm text-blue-800">
                            <strong>Empleado seleccionado:</strong> {selectedEmployee.employee_number} - {selectedEmployee.first_name} {selectedEmployee.last_name}
                        </p>
                    </div>
                )}
            </div>

            {selectedEmployee && (
                <>
                    {/* Current Assignments Section */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">
                                Asignaciones Actuales ({currentAssignments.length})
                            </h2>
                            {canReturnAssets && currentAssignments.length > 0 && (
                                <button
                                    onClick={handleUnassignAllClick}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                                >
                                    <FontAwesomeIcon icon={faUndo} className="mr-2" />
                                    Desasignar Todo
                                </button>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            {currentAssignments.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    No hay asignaciones activas para este empleado.
                                </p>
                            ) : (
                                <>
                                    {/* Mobile cards */}
                                    <div className="block sm:hidden space-y-4 p-4">
                                        {currentAssignments.map((assignment) => (
                                            <div key={assignment.id} className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900">{assignment.activo_hostname}</h3>
                                                        <p className="text-sm text-gray-600">Serie: {assignment.activo_serie}</p>
                                                        <p className="text-sm text-gray-600">Tipo: {assignment.activo_tipo_activo_name}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => setExpandedCards(prev => {
                                                                const newSet = new Set(prev);
                                                                if (newSet.has(assignment.id)) {
                                                                    newSet.delete(assignment.id);
                                                                } else {
                                                                    newSet.add(assignment.id);
                                                                }
                                                                return newSet;
                                                            })}
                                                            className="text-gray-600 hover:text-gray-800 text-sm"
                                                            title="Más detalles"
                                                        >
                                                            <FontAwesomeIcon icon={expandedCards.has(assignment.id) ? faChevronUp : faChevronDown} />
                                                        </button>
                                                        <div className="flex flex-col space-y-1">
                                                            <button
                                                                onClick={() => handleViewClick(assignment)}
                                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                                                title="Ver Asignación"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </button>
                                                            {canReturnAssets && (
                                                                <button
                                                                    onClick={() => handleReturnClick(assignment)}
                                                                    className="text-orange-600 hover:text-orange-800 text-sm"
                                                                    title="Desasignar"
                                                                >
                                                                    <FontAwesomeIcon icon={faUndo} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {expandedCards.has(assignment.id) && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                                        <p className="text-sm text-gray-600">Marca: {assignment.activo_marca_name}</p>
                                                        <p className="text-sm text-gray-600">Modelo: {assignment.activo_modelo_name}</p>
                                                        <p className="text-sm text-gray-600">Empleado: {assignment.employee_name}</p>
                                                        <p className="text-sm text-gray-600">Usuario: {assignment.assigned_by_name}</p>
                                                        <p className="text-sm text-gray-600">Fecha: {new Date(assignment.assigned_date).toLocaleDateString('es-ES')}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {/* Desktop table */}
                                    <div className="hidden sm:block">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Fecha Asignación
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Empleado
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                                        Usuario
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Tipo
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Hostname
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                                        Serie
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                                        Marca
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                                        Modelo
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Acciones
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {currentAssignments.map((assignment) => (
                                                    <tr key={assignment.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {new Date(assignment.assigned_date).toLocaleDateString('es-ES')}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {assignment.employee_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 hidden sm:table-cell">
                                                            {assignment.assigned_by_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {assignment.activo_tipo_activo_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                            {assignment.activo_hostname}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 hidden sm:table-cell">
                                                            {assignment.activo_serie}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 hidden sm:table-cell">
                                                            {assignment.activo_marca_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 hidden sm:table-cell">
                                                            {assignment.activo_modelo_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleViewClick(assignment)}
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                    title="Ver Asignación"
                                                                >
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                </button>
                                                                {canReturnAssets && (
                                                                    <button
                                                                        onClick={() => handleReturnClick(assignment)}
                                                                        className="text-orange-600 hover:text-orange-800"
                                                                        title="Desasignar"
                                                                    >
                                                                        <FontAwesomeIcon icon={faUndo} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                </>
            )}

            {/* All Assignments Table */}
            <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-4 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">
                        Todas las Asignaciones ({groupedAssignments.length} empleados)
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    {groupedAssignments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                            No hay asignaciones activas.
                        </p>
                    ) : (
                        <>
                            {/* Mobile cards */}
                            <div className="block sm:hidden space-y-4 p-4">
                                {groupedAssignments.map((group) => (
                                    <div key={group.employee_id} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{group.employee_name} ({group.employee_number})</h3>
                                                <p className="text-sm text-gray-600">Usuario: {group.assigned_by}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setExpandedGroups(prev => {
                                                        const newSet = new Set(prev);
                                                        if (newSet.has(group.employee_id)) {
                                                            newSet.delete(group.employee_id);
                                                        } else {
                                                            newSet.add(group.employee_id);
                                                        }
                                                        return newSet;
                                                    })}
                                                    className="text-gray-600 hover:text-gray-800 text-sm"
                                                    title="Ver Activos Asignados"
                                                >
                                                    <FontAwesomeIcon icon={expandedGroups.has(group.employee_id) ? faChevronUp : faChevronDown} />
                                                </button>
                                                <div className="flex flex-col space-y-1">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEmployeeId(group.employee_id.toString());
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                        title="Ver Asignaciones"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </button>
                                                    {canReturnAssets && (
                                                        <button
                                                            onClick={() => {
                                                                // Unassign all for this employee
                                                                const confirmUnassign = window.confirm(`¿Desea desasignar todos los activos de ${group.employee_name}?`);
                                                                if (confirmUnassign) {
                                                                    handleUnassignAllForEmployee(group.assignments);
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-800 text-sm"
                                                            title="Desasignar Todo"
                                                        >
                                                            <FontAwesomeIcon icon={faUndo} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {expandedGroups.has(group.employee_id) && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                                                {group.assignments.map((assignment) => (
                                                    <div key={assignment.id} className="bg-white p-2 rounded text-xs">
                                                        <div className="font-medium">{assignment.activo_hostname} ({assignment.activo_serie})</div>
                                                        <div className="text-gray-600">
                                                            Tipo: {assignment.activo_tipo_activo_name} | Marca: {assignment.activo_marca_name} | Modelo: {assignment.activo_modelo_name} | Fecha: {new Date(assignment.assigned_date).toLocaleDateString('es-ES')}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Desktop table */}
                            <div className="hidden sm:block">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Empleado
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                                Usuario
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Activos Asignados
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {groupedAssignments.map((group) => (
                                            <tr key={group.employee_id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {group.employee_name} ({group.employee_number})
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 hidden sm:table-cell">
                                                    {group.assigned_by}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    <div className="space-y-2">
                                                        {group.assignments.map((assignment) => (
                                                            <div key={assignment.id} className="bg-gray-50 p-2 rounded text-xs">
                                                                <div className="font-medium">{assignment.activo_hostname} ({assignment.activo_serie})</div>
                                                                <div className="text-gray-600">
                                                                    Tipo: {assignment.activo_tipo_activo_name} |
                                                                    Marca: {assignment.activo_marca_name} |
                                                                    Modelo: {assignment.activo_modelo_name} |
                                                                    Fecha: {new Date(assignment.assigned_date).toLocaleDateString('es-ES')}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedEmployeeId(group.employee_id.toString());
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Ver Asignaciones"
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </button>
                                                        {canReturnAssets && (
                                                            <button
                                                                onClick={() => {
                                                                    // Unassign all for this employee
                                                                    const confirmUnassign = window.confirm(`¿Desea desasignar todos los activos de ${group.employee_name}?`);
                                                                    if (confirmUnassign) {
                                                                        handleUnassignAllForEmployee(group.assignments);
                                                                    }
                                                                }}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Desasignar Todo"
                                                            >
                                                                <FontAwesomeIcon icon={faUndo} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {allAssignmentsTotalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200">
                        <Pagination
                            currentPage={allAssignmentsPage}
                            totalPages={allAssignmentsTotalPages}
                            pageSize={allAssignmentsPageSize}
                            pageSizeOptions={[5, 10, 20, 50]}
                            onPageChange={handleAllAssignmentsPageChange}
                            onPageSizeChange={handleAllAssignmentsPageSizeChange}
                        />
                    </div>
                )}
            </div>

            {/* Assignment Modal */}
            <AssignmentModal
                show={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                selectedEmployee={selectedEmployee}
                onAssignmentSuccess={handleAssignmentSuccess}
            />

            {/* Return Modal */}
            {isReturnModalOpen && assignmentToReturn && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Devolver Activo
                            </h3>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    Activo: {assignmentToReturn.activo_hostname} ({assignmentToReturn.activo_serie})
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    Empleado: {assignmentToReturn.employee_name} ({assignmentToReturn.employee_number})
                                </p>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Devolución
                                </label>
                                <input
                                    type="date"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsReturnModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleReturnConfirm}
                                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                                    disabled={loading}
                                >
                                    {loading ? 'Devolviendo...' : 'Confirmar Devolución'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Assignment Modal */}
            {isViewModalOpen && assignmentToView && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-70">
                    <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Detalles de Asignación - {assignmentToView.activo_hostname}
                            </h3>
                            <div className="space-y-4">
                                {/* Basic Assignment Info */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-blue-800 mb-2">Información de Asignación</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Fecha:</span> {new Date(assignmentToView.assigned_date).toLocaleDateString('es-ES')}
                                        </div>
                                        <div>
                                            <span className="font-medium">Usuario:</span> {assignmentToView.assigned_by_name}
                                        </div>
                                        <div>
                                            <span className="font-medium">Empleado:</span> {assignmentToView.employee_name} ({assignmentToView.employee_number})
                                        </div>
                                        <div>
                                            <span className="font-medium">Tipo:</span> {assignmentToView.activo_tipo_activo_name}
                                        </div>
                                    </div>
                                </div>

                                {/* Asset Basic Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-800 mb-2">Información del Activo</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Hostname:</span> <span className="font-mono bg-white px-1 rounded">{assignmentToView.activo_hostname}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Serie:</span> <span className="font-mono bg-white px-1 rounded">{assignmentToView.activo_serie}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Marca:</span> {assignmentToView.activo_marca_name}
                                        </div>
                                        <div>
                                            <span className="font-medium">Modelo:</span> {assignmentToView.activo_modelo_name}
                                        </div>
                                    </div>
                                </div>

                                {/* Asset Specifications */}
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-green-800 mb-2">Especificaciones Técnicas</h4>
                                    <div className="text-sm">
                                        {(() => {
                                            const tipo = assignmentToView.activo_tipo_activo_name?.toLowerCase() || '';
                                            const computoTypes = ['computadora', 'laptop', 'desktop', 'servidor', 'all in one'];
                                            const redTypes = ['switch', 'router', 'routers', 'firewall', 'ap wifi', 'p2p'];

                                            if (computoTypes.some(t => tipo.includes(t))) {
                                                return (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {assignmentToView.activo_procesador && (
                                                            <div><span className="font-medium">Procesador:</span> {assignmentToView.activo_procesador}</div>
                                                        )}
                                                        {assignmentToView.activo_ram && (
                                                            <div><span className="font-medium">RAM:</span> {assignmentToView.activo_ram} GB</div>
                                                        )}
                                                        {assignmentToView.activo_almacenamiento && (
                                                            <div><span className="font-medium">Almacenamiento:</span> {assignmentToView.activo_almacenamiento}</div>
                                                        )}
                                                        {assignmentToView.activo_tarjeta_grafica && (
                                                            <div><span className="font-medium">Tarjeta Gráfica:</span> {assignmentToView.activo_tarjeta_grafica}</div>
                                                        )}
                                                        <div><span className="font-medium">WiFi:</span> {Boolean(assignmentToView.activo_wifi) ? 'Sí' : 'No'}</div>
                                                        <div><span className="font-medium">Ethernet:</span> {Boolean(assignmentToView.activo_ethernet) ? 'Sí' : 'No'}</div>
                                                    </div>
                                                );
                                            } else if (redTypes.some(t => tipo.includes(t))) {
                                                return (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {assignmentToView.activo_puertos_ethernet && (
                                                            <div><span className="font-medium">Puertos Ethernet:</span> {assignmentToView.activo_puertos_ethernet}</div>
                                                        )}
                                                        {assignmentToView.activo_puertos_sfp && (
                                                            <div><span className="font-medium">Puertos SFP:</span> {assignmentToView.activo_puertos_sfp}</div>
                                                        )}
                                                        <div><span className="font-medium">Puerto Consola:</span> {Boolean(assignmentToView.activo_puerto_consola) ? 'Sí' : 'No'}</div>
                                                        {assignmentToView.activo_puertos_poe && (
                                                            <div><span className="font-medium">Puertos PoE:</span> {assignmentToView.activo_puertos_poe}</div>
                                                        )}
                                                        {assignmentToView.activo_alimentacion && (
                                                            <div><span className="font-medium">Alimentación:</span> {assignmentToView.activo_alimentacion}</div>
                                                        )}
                                                        <div><span className="font-medium">Administrable:</span> {Boolean(assignmentToView.activo_administrable) ? 'Sí' : 'No'}</div>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {assignmentToView.activo_tamano && (
                                                            <div><span className="font-medium">Tamaño:</span> {assignmentToView.activo_tamano}</div>
                                                        )}
                                                        {assignmentToView.activo_color && (
                                                            <div><span className="font-medium">Color:</span> {assignmentToView.activo_color}</div>
                                                        )}
                                                        {assignmentToView.activo_conectores && (
                                                            <div className="col-span-2"><span className="font-medium">Conectores:</span> {assignmentToView.activo_conectores}</div>
                                                        )}
                                                        {assignmentToView.activo_cables && (
                                                            <div className="col-span-2"><span className="font-medium">Cables:</span> {assignmentToView.activo_cables}</div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {/* Unassign All Modal */}
            {isUnassignAllModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Desasignar Todos los Activos
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                ¿Está seguro de que desea desasignar todos los activos asignados a {selectedEmployee?.first_name} {selectedEmployee?.last_name}?
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsUnassignAllModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        handleUnassignAllForEmployee(currentAssignments);
                                        setIsUnassignAllModalOpen(false);
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    disabled={loading}
                                >
                                    {loading ? 'Desasignando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AssignmentPage;