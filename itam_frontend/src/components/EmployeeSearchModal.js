/**
 * Modal de búsqueda avanzada de empleados.
 *
 * Proporciona una interfaz modal para buscar y seleccionar empleados
 * con filtros avanzados. Utilizado principalmente para asignar
 * supervisores o empleados a usuarios.
 *
 * Características principales:
 * - Búsqueda en tiempo real con debounce
 * - Filtro opcional para empleados disponibles para usuarios
 * - Selección visual con indicadores
 * - Información detallada de empleados (departamento, área)
 * - Estados de carga y manejo de errores
 * - Confirmación de selección antes de cerrar
 */

import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import Modal from './Modal';
import { getEmployees } from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCircleNotch } from '@fortawesome/free-solid-svg-icons';

const EmployeeSearchModal = ({ show, onClose, onSelect, availableForUser = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    useEffect(() => {
        if (show) {
            setSearchTerm('');
            setResults([]);
            setSelectedEmployee(null);
        }
    }, [show]);

    // Function that performs the search
    const performSearch = async (query) => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const params = {
                search: query,
                page_size: 50
            };
            if (availableForUser) {
                params.available_for_user = 'true';
            }
            const response = await getEmployees(params);
            setResults(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error searching employees:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search function
    const debouncedSearch = useCallback(debounce(performSearch, 300), []);

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        debouncedSearch(query);
    };

    const handleSelect = (employee) => {
        setSelectedEmployee(employee);
    };

    const handleConfirm = () => {
        if (selectedEmployee) {
            onSelect(selectedEmployee);
            onClose();
        }
    };

    return (
        <Modal show={show} onClose={onClose} title="Buscar Jefe Inmediato" size="sm">
            <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        placeholder="Buscar por nombre o número de empleado..."
                        className="w-full p-2 pl-10 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        {loading ? (
                            <FontAwesomeIcon icon={faCircleNotch} spin className="text-blue-500" />
                        ) : (
                            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                        )}
                    </div>
                </div>

                {/* Results List */}
                <div className="max-h-96 overflow-y-auto border rounded-md">
                    {results.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {results.map((employee) => (
                                <li
                                    key={employee.id}
                                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                                        selectedEmployee?.id === employee.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                    }`}
                                    onClick={() => handleSelect(employee)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                                {employee.employee_number} - {employee.first_name} {employee.last_name}
                                            </div>
                                            {employee.department_name && (
                                                <div className="text-sm text-gray-500">
                                                    {employee.department_name}
                                                    {employee.area_name && ` - ${employee.area_name}`}
                                                </div>
                                            )}
                                        </div>
                                        {selectedEmployee?.id === employee.id && (
                                            <div className="text-blue-600">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : searchTerm.length >= 2 && !loading ? (
                        <div className="p-4 text-center text-gray-500">
                            No se encontraron empleados para "{searchTerm}"
                        </div>
                    ) : searchTerm.length < 2 ? (
                        <div className="p-4 text-center text-gray-500">
                            Escribe al menos 2 caracteres para buscar
                        </div>
                    ) : null}
                </div>

                {/* Selected Employee Display */}
                {selectedEmployee && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <div className="text-sm text-blue-800 font-medium">Seleccionado:</div>
                        <div className="text-blue-900">
                            {selectedEmployee.employee_number} - {selectedEmployee.first_name} {selectedEmployee.last_name}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!selectedEmployee}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Seleccionar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EmployeeSearchModal;