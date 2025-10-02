// itam_frontend/src/pages/employees/EmployeesPage.js

import React, { useState, useEffect } from 'react';
import { getEmployees, deleteEmployee } from '../../api';
import EmployeeFormModal from './EmployeeFormModal';
import EmployeeDetailModal from './EmployeeDetailModal';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [sortField, setSortField] = useState('employee_number');
    const [sortDirection, setSortDirection] = useState('asc');
    const { hasPermission } = useAuth();

    const canAddEmployee = hasPermission('employees.add_employee');
    const canChangeEmployee = hasPermission('employees.change_employee');
    const canDeleteEmployee = hasPermission('employees.delete_employee');

    useEffect(() => {
        fetchEmployees(currentPage, pageSize);
    }, [currentPage, pageSize, searchText, sortField, sortDirection]);

    const fetchEmployees = async (page = 1, size = 5) => {
        try {
            const params = { page, page_size: size };

            // Add search text
            if (searchText.trim()) params.search = searchText.trim();

            // Add ordering
            const ordering = sortDirection === 'desc' ? `-${sortField}` : sortField;
            params.ordering = ordering;

            const response = await getEmployees(params);
            setEmployees(response.data.results);
            setTotalCount(response.data.count);
            setTotalPages(Math.ceil(response.data.count / size));
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Error al cargar los empleados.');
        }
    };

    const handleAddClick = () => {
        setCurrentEmployee(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (employee) => {
        setCurrentEmployee(employee);
        setIsModalOpen(true);
    };

    const handleViewClick = (employee) => {
        setSelectedEmployee(employee);
        setIsDetailModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
            return;
        }
        try {
            await deleteEmployee(id);
            toast.success('Empleado eliminado correctamente.');
            fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || 'Error al eliminar el empleado.';
            toast.error(errorMessage);
        }
    };

    const handleSaveSuccess = () => {
        fetchEmployees(currentPage, pageSize);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentEmployee(null);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedEmployee(null);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            // Toggle direction if same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to ascending
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    const getSortIcon = (field) => {
        if (sortField !== field) {
            return faSort;
        }
        return sortDirection === 'asc' ? faSortUp : faSortDown;
    };

    return (
        <div className="p-4">
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Gestión de Empleados
                    </h1>
                    <div className="flex items-center space-x-4">
                        {/* Search Box */}
                        <div className="relative">
                            <label htmlFor="search" className="sr-only">Buscar Empleados</label>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="search"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Buscar por número, nombre..."
                            />
                        </div>
                        {canAddEmployee && (
                            <button
                                onClick={handleAddClick}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Crear Nuevo Empleado
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('employee_number')}>
                                <div className="flex items-center">
                                    No. Empleado
                                    <FontAwesomeIcon icon={getSortIcon('employee_number')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('first_name')}>
                                <div className="flex items-center">
                                    Nombres
                                    <FontAwesomeIcon icon={getSortIcon('first_name')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('last_name')}>
                                <div className="flex items-center">
                                    Apellidos
                                    <FontAwesomeIcon icon={getSortIcon('last_name')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('department__name')}>
                                <div className="flex items-center">
                                    Departamento
                                    <FontAwesomeIcon icon={getSortIcon('department__name')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('area__name')}>
                                <div className="flex items-center">
                                    Área
                                    <FontAwesomeIcon icon={getSortIcon('area__name')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('region__name')}>
                                <div className="flex items-center">
                                    Región
                                    <FontAwesomeIcon icon={getSortIcon('region__name')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('finca__name')}>
                                <div className="flex items-center">
                                    Finca
                                    <FontAwesomeIcon icon={getSortIcon('finca__name')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('start_date')}>
                                <div className="flex items-center">
                                    Inicio de Labores
                                    <FontAwesomeIcon icon={getSortIcon('start_date')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Jefe Inmediato
                            </th>
                            {(canChangeEmployee || canDeleteEmployee) && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan={(canChangeEmployee || canDeleteEmployee) ? 10 : 9} className="px-6 py-4 text-center text-gray-500">
                                    No hay empleados disponibles.
                                </td>
                            </tr>
                        ) : (
                            employees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {employee.employee_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {employee.first_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {employee.last_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {employee.department_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {employee.area_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {employee.region_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {employee.finca_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {employee.start_date ? new Date(employee.start_date).toLocaleDateString('es-ES') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {employee.supervisor_name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button
                                            onClick={() => handleViewClick(employee)}
                                            className="text-blue-600 hover:text-blue-900 p-2"
                                            title="Ver Detalles"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        {canChangeEmployee && (
                                            <button
                                                onClick={() => handleEditClick(employee)}
                                                className="text-indigo-600 hover:text-indigo-900 p-2 ml-2"
                                                title="Editar"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                        )}
                                        {canDeleteEmployee && (
                                            <button
                                                onClick={() => handleDeleteClick(employee.id)}
                                                className="text-red-600 hover:text-red-900 p-2 ml-2"
                                                title="Eliminar"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    pageSizeOptions={[5, 10, 20, 50]}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            <EmployeeFormModal
                show={isModalOpen}
                onClose={handleCloseModal}
                onSaveSuccess={handleSaveSuccess}
                employeeToEdit={currentEmployee}
            />

            <EmployeeDetailModal
                show={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                employee={selectedEmployee}
                onEmployeeUpdate={() => {
                    fetchEmployees(currentPage, pageSize);
                    // Update selectedEmployee with fresh data
                    if (selectedEmployee) {
                        const updatedEmployee = employees.find(e => e.id === selectedEmployee.id);
                        if (updatedEmployee) {
                            setSelectedEmployee(updatedEmployee);
                        }
                    }
                }}
            />

        </div>
    );
}

export default EmployeesPage;