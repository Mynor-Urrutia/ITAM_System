/**
 * Componente de Autocompletado para Empleados.
 *
 * Proporciona búsqueda en tiempo real de empleados con funcionalidad
 * de autocompletado. Incluye debounce para optimizar peticiones,
 * manejo de estados de carga y selección intuitiva.
 *
 * Características principales:
 * - Búsqueda en tiempo real con debounce de 300ms
 * - Dropdown con resultados paginados (máximo 50)
 * - Carga automática del nombre cuando hay ID preseleccionado
 * - Estados visuales de carga y búsqueda
 * - Manejo de errores y casos edge
 * - Diseño responsive y accesible
 * - Integración perfecta con formularios React
 */

import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
const EmployeeAutocomplete = ({
    name,
    label,
    value,
    onChange,
    placeholder = "Escribe para buscar...",
    required = false,
    disabled = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedName, setSelectedName] = useState('');

    // Función que realiza la petición a la API con el término de búsqueda
    const fetchResults = async (query) => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            // Usa el parámetro 'search' de DjangoFilterBackend
            const response = await api.get('employees/employees/', {
                params: { search: query, page_size: 50 } // Limit results
            });
            setResults(response.data.results || response.data || []);
            setIsOpen(true);
        } catch (error) {
            console.error(`Error fetching employees:`, error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Aplica un retraso (debounce) de 300ms a la función de búsqueda
    const debouncedFetch = useCallback(debounce(fetchResults, 300), []);

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        // Reinicia el valor del formulario padre si el usuario empieza a buscar
        if (value && query.length > 0) {
            onChange({ target: { name, value: null } });
        }
        debouncedFetch(query);
    };

    const handleSelect = (employee) => {
        // Notifica al formulario padre con el ID
        onChange({ target: { name, value: employee.id } });

        setSelectedName(`${employee.employee_number} - ${employee.first_name} ${employee.last_name}`);
        setSearchTerm(''); // Limpia el término de búsqueda
        setIsOpen(false);
        setResults([]);
    };

    // Efecto para cargar el nombre inicial si el formulario ya tiene un ID (modo Edición)
    useEffect(() => {
        if (value && !searchTerm) {
            const fetchInitialName = async () => {
                try {
                    // Pide el detalle del empleado
                    const response = await api.get(`employees/employees/${value}/`);
                    setSelectedName(`${response.data.employee_number} - ${response.data.first_name} ${response.data.last_name}`);
                } catch (error) {
                    console.error("Error fetching initial employee data for selected ID:", error);
                    setSelectedName(`ID [${value}] no válido`);
                }
            };
            fetchInitialName();
        } else if (!value && !searchTerm) {
            setSelectedName(''); // Limpiar si el valor del padre es null o 0
        }
    }, [value, searchTerm]);

    const displayValue = () => {
        // 1. Si hay término de búsqueda, muestra lo que el usuario está escribiendo.
        if (searchTerm) return searchTerm;
        // 2. Si no hay término, pero hay un ID seleccionado, muestra el nombre cargado.
        if (value && selectedName) return selectedName;
        // 3. Si no hay nada, muestra el placeholder.
        return '';
    }

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type="text"
                    // Controla el valor mostrado en el input
                    value={displayValue()}
                    onChange={handleInputChange}
                    onFocus={() => {
                        // Permite abrir el dropdown incluso si está lleno, para que pueda buscar.
                        setIsOpen(true);
                    }}
                    onBlur={() => {
                        // Retraso para que el click en un resultado se registre antes de cerrar.
                        setTimeout(() => setIsOpen(false), 200);
                    }}
                    placeholder={placeholder}
                    className={`w-full p-2 border rounded-md shadow-sm ${disabled ? 'bg-gray-100' : 'bg-white'} focus:ring-blue-500 focus:border-blue-500`}
                    autoComplete="off"
                    disabled={disabled}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {isLoading ? (
                        <FontAwesomeIcon icon={faCircleNotch} spin className="text-blue-500" />
                    ) : (
                        <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                    )}
                </div>
            </div>

            {/* Dropdown de resultados. Se muestra si está abierto Y hay término de búsqueda (o resultados previos). */}
            {isOpen && (searchTerm.length >= 2 || (value && selectedName && !searchTerm)) && (
                <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                    {isLoading && searchTerm ? (
                        <li className="p-2 text-gray-500 flex items-center">
                            <FontAwesomeIcon icon={faCircleNotch} spin className="mr-2" />
                            Buscando...
                        </li>
                    ) : results.length > 0 ? (
                        results.map((employee) => (
                            <li
                                key={employee.id}
                                className="p-2 cursor-pointer hover:bg-gray-100"
                                // onMouseDown captura el evento antes que onBlur, permitiendo la selección.
                                onMouseDown={() => handleSelect(employee)}
                            >
                                {employee.employee_number} - {employee.first_name} {employee.last_name}
                            </li>
                        ))
                    ) : searchTerm.length >= 2 ? (
                        <li className="p-2 text-gray-500">
                            No se encontraron empleados para "{searchTerm}"
                        </li>
                    ) : (
                        <li className="p-2 text-gray-500">
                            Escribe al menos 2 caracteres para buscar.
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default EmployeeAutocomplete;