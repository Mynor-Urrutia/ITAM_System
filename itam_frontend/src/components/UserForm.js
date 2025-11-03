/**
 * Componente de formulario para creación y edición de usuarios.
 *
 * Gestiona la creación de nuevos usuarios y la edición de usuarios existentes,
 * incluyendo asignación de roles, información organizacional y vinculación
 * con empleados. Incluye validaciones, manejo de errores y carga de datos maestros.
 *
 * Características principales:
 * - Formulario dual: creación y edición de usuarios
 * - Asignación múltiple de roles con selección múltiple
 * - Vinculación opcional con empleados existentes
 * - Campos organizacionales: departamento, región, empleado
 * - Validaciones de contraseña y campos requeridos
 * - Manejo de permisos (staff/superuser solo para superusuarios)
 * - Estados de carga y manejo de errores
 * - Búsqueda de empleados con modal dedicado
 */

import React, { useState, useEffect } from 'react';
import { getRegions, getDepartamentos, getEmployees } from '../api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import EmployeeSearchModal from './EmployeeSearchModal';
import api from '../api';

// Opciones estáticas para campos de selección
const PUESTO_CHOICES = [
    'Gerente', 'Coordinador', 'Analista', 'Técnico', 'Desarrollador', 'Soporte', 'Otro'
];
const STATUS_CHOICES = [
    'Activo', 'Inactivo', 'Vacaciones', 'Licencia'
];

/**
 * Componente principal del formulario de usuarios.
 *
 * @param {Object} user - Usuario a editar (null para creación)
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onSubmit - Función para enviar datos (crear/actualizar)
 * @param {Array} roles - Lista de roles disponibles para asignar
 */
function UserForm({ user, onClose, onSubmit, roles }) {
    const isEditing = !!user;
    const { user: loggedInUser } = useAuth(); // Usuario logueado para verificar permisos

    // Estado inicial del formulario con valores por defecto
    const initialFormData = {
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        puesto: '',
        departamento: null, // FK opcional - ID del departamento
        region: null,       // FK opcional - ID de la región
        employee: null,     // FK opcional - ID del empleado
        status: 'Activo',
        assigned_role_ids: [], // Array de IDs de roles asignados
        is_staff: false,
        is_superuser: false,
    };

    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // ESTADO PARA DATOS MAESTROS (NUEVO)
    const [regions, setRegions] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [employees, setEmployees] = useState([]);

    // Estado para el modal de búsqueda de empleados
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [employeeName, setEmployeeName] = useState('');


    useEffect(() => {
        // Función para cargar los datos maestros
        const fetchMasterData = async () => {
            try {
                // Usamos Promise.all para cargar regiones, departamentos y empleados en paralelo
                const [regionsResponse, departamentosResponse, employeesResponse] = await Promise.all([
                    getRegions(),
                    getDepartamentos(),
                    getEmployees()
                ]);
                // La data debe ser un array de objetos con { id, name }
                setRegions(regionsResponse.data.results || regionsResponse.data);
                setDepartamentos(departamentosResponse.data.results || departamentosResponse.data);
                setEmployees(employeesResponse.data.results || employeesResponse.data);
            } catch (err) {
                console.error("Error al cargar datos maestros:", err);
                toast.error("Error al cargar las listas de Regiones y Departamentos.");
            }
        };

        fetchMasterData();
    }, []);

    const loadEmployeeName = async (employeeId) => {
        try {
            const response = await api.get(`employees/employees/${employeeId}/`);
            const employee = response.data;
            if (employee) {
                setEmployeeName(`${employee.employee_number} - ${employee.first_name} ${employee.last_name}`);
            }
        } catch (error) {
            console.error('Error loading employee name:', error);
            setEmployeeName('Error al cargar nombre');
        }
    };

    const handleEmployeeSelect = (employee) => {
        setFormData(prev => ({ ...prev, employee: employee.id }));
        setEmployeeName(`${employee.employee_number} - ${employee.first_name} ${employee.last_name}`);
    };

    useEffect(() => {
        if (isEditing) {
            // Lógica existente para precargar datos de usuario
            // Asegúrate de que los campos 'departamento' y 'region' sean el ID o null
            setFormData({
                id: user.id, // Include id for editing
                username: user.username || '',
                email: user.email || '',
                password: '', // Nunca precargar la contraseña
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                puesto: user.puesto || '',
                // IMPORTANTE: Asignar el ID. Si el valor es falsy (null, 0, undefined), se usa null.
                departamento: user.departamento || null, // user.departamento es el ID
                region: user.region || null,           // user.region es el ID
                employee: user.employee || null,       // user.employee es el ID
                status: user.status || 'Activo',
                // Los roles se manejan como un array de strings (IDs)
                assigned_role_ids: (user.role_ids || []).map(id => id.toString()),
                is_staff: user.is_staff || false,
                is_superuser: user.is_superuser || false,
            });
            // Load employee name if exists
            if (user.employee) {
                loadEmployeeName(user.employee);
            } else {
                setEmployeeName('');
            }
        } else {
            setEmployeeName('');
        }
    }, [user, isEditing]);

    // MANEJO DE CAMBIOS (ACTUALIZADO para manejar selects y nulls)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = value;
        
        // Convertir el valor de los SELECTs a entero (ID) o null si se selecciona la opción vacía
        if (name === 'departamento' || name === 'region' || name === 'employee') {
            // Si el valor del select es la cadena vacía (''), lo convertimos a null
            // ya que representa 'Sin asignar' y el backend espera null para FK opcionales.
            // De lo contrario, lo convertimos a entero.
            newValue = value === '' ? null : parseInt(value, 10);
        } else if (name === 'assigned_role_ids') {
            // Para múltiples roles, mantener como array de strings
            newValue = Array.from(e.target.selectedOptions, option => option.value);
        } else if (type === 'checkbox') {
            newValue = checked;
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue,
        }));
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!isEditing && formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            toast.error('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        // Crear una copia de los datos, excluyendo la contraseña si estamos editando y no se ha cambiado
        const dataToSend = { ...formData };
        if (isEditing && !formData.password) {
            delete dataToSend.password;
        }

        // El backend espera 'groups' como una lista de IDs enteros
        dataToSend.assigned_role_ids = (dataToSend.assigned_role_ids || []).map(id => parseInt(id, 10));


        setLoading(true);
        // Llama a la función onSubmit (crear o actualizar) pasada por prop
        onSubmit(dataToSend)
            .then(() => {
                setLoading(false);
                onClose();
            })
            .catch(err => {
                console.error(err.response || err);
                const errorMessage = err.response?.data?.username?.[0] || 
                                     err.response?.data?.email?.[0] || 
                                     err.response?.data?.detail || 
                                     'Error al guardar el usuario. Verifica los datos.';
                setError(errorMessage);
                toast.error(errorMessage);
                setLoading(false);
            });
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-8 max-h-[600px] overflow-y-auto">
            {/* Información Personal */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Información Personal</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nombre de Usuario *</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
                {/* Contraseña (solo requerida en creación o si se cambia en edición) */}
                <div className="mt-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">{isEditing ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!isEditing}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Nombre *</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Apellido *</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Información Organizacional */}
            <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Información Organizacional</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="puesto" className="block text-sm font-medium text-gray-700">Puesto</label>
                        <select
                            id="puesto"
                            name="puesto"
                            value={formData.puesto}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Seleccionar Puesto --</option>
                            {PUESTO_CHOICES.map(choice => (
                                <option key={choice} value={choice}>{choice}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">Departamento</label>
                        <select
                            id="departamento"
                            name="departamento"
                            value={formData.departamento || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Sin Departamento --</option>
                            {departamentos.map(dpto => (
                                <option key={dpto.id} value={dpto.id}>
                                    {dpto.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="region" className="block text-sm font-medium text-gray-700">Región</label>
                        <select
                            id="region"
                            name="region"
                            value={formData.region || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Sin Región --</option>
                            {regions.map(region => (
                                <option key={region.id} value={region.id}>
                                    {region.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="employee" className="block text-sm font-medium text-gray-700">Empleado</label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={employeeName}
                                readOnly
                                placeholder="Seleccione un empleado..."
                                className="flex-1 block w-full rounded-md bg-gray-50 border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            <button
                                type="button"
                                onClick={() => setShowEmployeeModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Roles y Estado */}
            <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Roles y Estado</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="assigned_role_ids" className="block text-sm font-medium text-gray-700">Roles</label>
                        <select
                            id="assigned_role_ids"
                            name="assigned_role_ids"
                            multiple
                            value={formData.assigned_role_ids}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {roles.map(role => (
                                <option key={role.id} value={role.id.toString()}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Mantén Ctrl (o Cmd) para seleccionar múltiples roles</p>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {STATUS_CHOICES.map(choice => (
                                <option key={choice} value={choice}>{choice}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* Checkboxes de Staff/Superuser (solo para Superusers logueados) */}
                {loggedInUser?.is_superuser && (
                    <div className="flex space-x-6 mt-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="is_staff"
                                id="is_staff"
                                checked={formData.is_staff}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="is_staff" className="block text-sm font-medium text-gray-700">Es Staff</label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="is_superuser"
                                id="is_superuser"
                                checked={formData.is_superuser}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="is_superuser" className="block text-sm font-medium text-gray-700">Es Superuser</label>
                        </div>
                    </div>
                )}
            </div>

            {/* Mensaje de Error */}
            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : (isEditing ? 'Actualizar Usuario' : 'Crear Usuario')}
                </button>
            </div>
        </form>

        {/* Employee Search Modal */}
        <EmployeeSearchModal
            show={showEmployeeModal}
            onClose={() => setShowEmployeeModal(false)}
            onSelect={handleEmployeeSelect}
            availableForUser={true}
        />
        </>
    );
}

export default UserForm;