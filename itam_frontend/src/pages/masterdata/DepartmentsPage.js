// C:\Proyectos\ITAM_System\itam_frontend\src\pages\masterdata\DepartmentsPage.js
import React, { useState, useEffect } from 'react';
import { getDepartamentos, deleteDepartamento } from '../../api'; // Importa las funciones API
import DepartmentFormModal from './DepartmentFormModal'; // Importa el modal del formulario
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext'; // Para permisos

function DepartmentsPage() {
    const [departamentos, setDepartamentos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDepartamento, setCurrentDepartamento] = useState(null); // Para editar
    const { hasPermission } = useAuth();

    const canAddDepartamento = hasPermission('masterdata.add_departamento');
    const canChangeDepartamento = hasPermission('masterdata.change_departamento');
    const canDeleteDepartamento = hasPermission('masterdata.delete_departamento');

    useEffect(() => {
        fetchDepartamentos();
    }, []);

    const fetchDepartamentos = async () => {
        try {
            const response = await getDepartamentos();
            setDepartamentos(response.data);
        } catch (error) {
            console.error('Error fetching departamentos:', error);
            toast.error('Error al cargar los departamentos.');
        }
    };

    const handleAddClick = () => {
        setCurrentDepartamento(null); // Para formulario de creación
        setIsModalOpen(true);
    };

    const handleEditClick = (departamento) => {
        setCurrentDepartamento(departamento); // Para formulario de edición
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este departamento? Esto eliminará también todas las áreas asociadas.')) {
            return;
        }
        try {
            await deleteDepartamento(id);
            toast.success('Departamento eliminado correctamente.');
            fetchDepartamentos(); // Refrescar la lista
        } catch (error) {
            console.error('Error deleting departamento:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || 'Error al eliminar el departamento.';
            toast.error(errorMessage);
        }
    };

    const handleSaveSuccess = () => {
        fetchDepartamentos(); // Refresca la lista después de guardar/actualizar
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentDepartamento(null); // Limpia el estado de edición al cerrar
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Departamentos</h1>

            {canAddDepartamento && (
                <div className="mb-8">
                    <button
                        onClick={handleAddClick}
                        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Crear Nuevo Departamento
                    </button>
                </div>
            )}

            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Listado de Departamentos</h2>
            {departamentos.length === 0 ? (
                <p className="text-gray-600">No hay departamentos disponibles.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Nombre</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Descripción</th>
                                {(canChangeDepartamento || canDeleteDepartamento) && <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {departamentos.map((dept) => (
                                <tr key={dept.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-800">{dept.id}</td>
                                    <td className="py-3 px-4 text-gray-800">{dept.name}</td>
                                    <td className="py-3 px-4 text-gray-800">{dept.description || 'N/A'}</td>
                                    {(canChangeDepartamento || canDeleteDepartamento) && (
                                        <td className="py-3 px-4">
                                            {canChangeDepartamento && (
                                                <button
                                                    onClick={() => handleEditClick(dept)}
                                                    className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 mr-2"
                                                >
                                                    Editar
                                                </button>
                                            )}
                                            {canDeleteDepartamento && (
                                                <button
                                                    onClick={() => handleDeleteClick(dept.id)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <DepartmentFormModal
                show={isModalOpen}
                onClose={handleCloseModal}
                onSaveSuccess={handleSaveSuccess}
                departamentoToEdit={currentDepartamento}
            />
        </div>
    );
}

export default DepartmentsPage;