/**
 * Formulario Completo para Modelos de Activos.
 *
 * Formulario avanzado para crear y editar modelos de activos tecnológicos
 * con campos dinámicos basados en el tipo de activo seleccionado.
 * Incluye validaciones específicas y manejo inteligente de datos.
 *
 * Características principales:
 * - Campos dinámicos según tipo de activo (computo/red/periférico)
 * - Especificaciones técnicas detalladas por categoría
 * - Validación inteligente de campos obligatorios
 * - Estados de carga y manejo de errores completo
 * - Diseño responsive con secciones organizadas
 * - Categorización automática basada en tipo de activo
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createModeloActivo, updateModeloActivo } from '../api';

function ModeloActivoForm({ modelo, onClose, onSave, marcas, tiposActivo }) {
    const isEditing = !!modelo;

    // Initialize form data based on editing mode
    const getInitialFormData = () => {
        if (isEditing && modelo) {
            return {
                name: modelo.name || '',
                marca: modelo.marca || '',
                tipo_activo: modelo.tipo_activo || '',
                // Campos para equipo de computo
                procesador: modelo.procesador || '',
                ram: modelo.ram || '',
                almacenamiento: modelo.almacenamiento || '',
                tarjeta_grafica: modelo.tarjeta_grafica || '',
                wifi: modelo.wifi || false,
                ethernet: modelo.ethernet || false,
                // Campos para equipos de red
                puertos_ethernet: modelo.puertos_ethernet || '',
                puertos_sfp: modelo.puertos_sfp || '',
                puerto_consola: modelo.puerto_consola || false,
                puertos_poe: modelo.puertos_poe || '',
                alimentacion: modelo.alimentacion || '',
                administrable: modelo.administrable || false,
                // Campos para perifericos
                tamano: modelo.tamano || '',
                color: modelo.color || '',
                conectores: modelo.conectores || '',
                cables: modelo.cables || '',
            };
        }
        return {
            name: '',
            marca: '',
            tipo_activo: '',
            // Campos para equipo de computo
            procesador: '',
            ram: '',
            almacenamiento: '',
            tarjeta_grafica: '',
            wifi: false,
            ethernet: false,
            // Campos para equipos de red
            puertos_ethernet: '',
            puertos_sfp: '',
            puerto_consola: false,
            puertos_poe: '',
            alimentacion: '',
            administrable: false,
            // Campos para perifericos
            tamano: '',
            color: '',
            conectores: '',
            cables: '',
        };
    };

    const [formData, setFormData] = useState(getInitialFormData);
    const [loading, setLoading] = useState(false);

    // Update form data when modelo changes (for editing)
    useEffect(() => {
        if (modelo) {
            // Editing mode - populate with existing data
            setFormData({
                name: modelo.name || '',
                marca: modelo.marca || '',
                tipo_activo: modelo.tipo_activo || '',
                // Campos para equipo de computo
                procesador: modelo.procesador || '',
                ram: modelo.ram || '',
                almacenamiento: modelo.almacenamiento || '',
                tarjeta_grafica: modelo.tarjeta_grafica || '',
                wifi: Boolean(modelo.wifi),
                ethernet: Boolean(modelo.ethernet),
                // Campos para equipos de red
                puertos_ethernet: modelo.puertos_ethernet || '',
                puertos_sfp: modelo.puertos_sfp || '',
                puerto_consola: Boolean(modelo.puerto_consola),
                puertos_poe: modelo.puertos_poe || '',
                alimentacion: modelo.alimentacion || '',
                administrable: Boolean(modelo.administrable),
                // Campos para perifericos
                tamano: modelo.tamano || '',
                color: modelo.color || '',
                conectores: modelo.conectores || '',
                cables: modelo.cables || '',
            });
        } else {
            // Creation mode - reset to empty
            setFormData({
                name: '',
                marca: '',
                tipo_activo: '',
                procesador: '',
                ram: '',
                almacenamiento: '',
                tarjeta_grafica: '',
                wifi: false,
                ethernet: false,
                puertos_ethernet: '',
                puertos_sfp: '',
                puerto_consola: false,
                puertos_poe: '',
                alimentacion: '',
                administrable: false,
                tamano: '',
                color: '',
                conectores: '',
                cables: '',
            });
        }
    }, [modelo]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : (name === 'tipo_activo' && value === '') ? null : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const getAssetTypeCategory = (tipoActivoId) => {
        if (!tipoActivoId) return 'periferico';
        const tipo = tiposActivo.find(t => t.id === parseInt(tipoActivoId));
        if (!tipo) return 'periferico';

        const tipoName = tipo.name.toLowerCase();

        // Equipos de computo
        const computoTypes = ['computadora', 'laptop', 'desktop', 'servidor', 'all in one'];
        if (computoTypes.some(t => tipoName.includes(t))) return 'computo';

        // Equipos de red
        const redTypes = ['switch', 'router', 'routers', 'firewall', 'ap wifi', 'p2p'];
        if (redTypes.some(t => tipoName.includes(t))) return 'red';

        return 'periferico';
    };

    const assetTypeCategory = getAssetTypeCategory(formData.tipo_activo);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.name || !formData.marca) {
            toast.error('El nombre y la marca son obligatorios.');
            setLoading(false);
            return;
        }

        try {
            // Prepare data based on asset type to avoid sending irrelevant fields
            const dataToSend = {
                name: formData.name,
                marca: Number(formData.marca),
                tipo_activo: formData.tipo_activo ? Number(formData.tipo_activo) : null,
            };

            // Add fields based on asset type category
            if (assetTypeCategory === 'computo') {
                dataToSend.procesador = formData.procesador || null;
                dataToSend.ram = formData.ram ? Number(formData.ram) : null;
                dataToSend.almacenamiento = formData.almacenamiento || null;
                dataToSend.tarjeta_grafica = formData.tarjeta_grafica || null;
                dataToSend.wifi = Boolean(formData.wifi);
                dataToSend.ethernet = Boolean(formData.ethernet);
            } else if (assetTypeCategory === 'red') {
                dataToSend.puertos_ethernet = formData.puertos_ethernet || null;
                dataToSend.puertos_sfp = formData.puertos_sfp || null;
                dataToSend.puerto_consola = Boolean(formData.puerto_consola);
                dataToSend.puertos_poe = formData.puertos_poe || null;
                dataToSend.alimentacion = formData.alimentacion || null;
                dataToSend.administrable = Boolean(formData.administrable);
            } else if (assetTypeCategory === 'periferico') {
                dataToSend.tamano = formData.tamano || null;
                dataToSend.color = formData.color || null;
                dataToSend.conectores = formData.conectores || null;
                dataToSend.cables = formData.cables || null;
            }

            if (isEditing) {
                await updateModeloActivo(modelo.id, dataToSend);
                toast.success('Modelo de Activo actualizado con éxito.');
            } else {
                await createModeloActivo(dataToSend);
                toast.success('Modelo de Activo creado con éxito.');
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Error al guardar el modelo:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.name?.[0] ||
                           error.response?.data?.marca?.[0] ||
                           error.response?.data?.tipo_activo?.[0] ||
                           'Error al guardar el modelo. Ya existe un modelo con ese nombre o hay un error de datos.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[600px] overflow-y-auto">
            {/* Campos básicos */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Modelo *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>

            <div>
                <label htmlFor="marca" className="block text-sm font-medium text-gray-700">Marca *</label>
                <select
                    id="marca"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                    <option value="">Seleccione una marca</option>
                    {marcas.map(marca => (
                        <option key={marca.id} value={marca.id}>{marca.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="tipo_activo" className="block text-sm font-medium text-gray-700">Tipo de Activo</label>
                <select
                    id="tipo_activo"
                    name="tipo_activo"
                    value={formData.tipo_activo || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                    <option value="">Seleccione un tipo</option>
                    {tiposActivo.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>{tipo.name}</option>
                    ))}
                </select>
            </div>

            {/* Campos específicos según el tipo de activo */}
            {assetTypeCategory === 'computo' && (
                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Especificaciones de Equipo de Computo</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="procesador" className="block text-sm font-medium text-gray-700">Procesador</label>
                            <input
                                type="text"
                                id="procesador"
                                name="procesador"
                                value={formData.procesador}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="ram" className="block text-sm font-medium text-gray-700">RAM (GB)</label>
                            <input
                                type="number"
                                id="ram"
                                name="ram"
                                value={formData.ram}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="almacenamiento" className="block text-sm font-medium text-gray-700">Almacenamiento</label>
                            <input
                                type="text"
                                id="almacenamiento"
                                name="almacenamiento"
                                value={formData.almacenamiento}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="tarjeta_grafica" className="block text-sm font-medium text-gray-700">Tarjeta Gráfica</label>
                            <input
                                type="text"
                                id="tarjeta_grafica"
                                name="tarjeta_grafica"
                                value={formData.tarjeta_grafica}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="wifi"
                                name="wifi"
                                checked={formData.wifi}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="wifi" className="ml-2 block text-sm text-gray-900">WIFI</label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="ethernet"
                                name="ethernet"
                                checked={formData.ethernet}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="ethernet" className="ml-2 block text-sm text-gray-900">Ethernet</label>
                        </div>
                    </div>
                </div>
            )}

            {assetTypeCategory === 'red' && (
                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Especificaciones de Equipo de Red</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="puertos_ethernet" className="block text-sm font-medium text-gray-700">Puertos Ethernet</label>
                            <select
                                id="puertos_ethernet"
                                name="puertos_ethernet"
                                value={formData.puertos_ethernet}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option value="">Seleccionar</option>
                                <option value="1">1 puertos</option>
                                <option value="2">2 puertos</option>
                                <option value="4">4 puertos</option>
                                <option value="8">8 puertos</option>
                                <option value="16">16 puertos</option>
                                <option value="24">24 puertos</option>
                                <option value="48">48 puertos</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="puertos_sfp" className="block text-sm font-medium text-gray-700">Puertos SFP</label>
                            <select
                                id="puertos_sfp"
                                name="puertos_sfp"
                                value={formData.puertos_sfp}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option value="">Seleccionar</option>
                                <option value="0">0 puertos</option>
                                <option value="2">2 puertos</option>
                                <option value="4">4 puertos</option>
                                <option value="8">8 puertos</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="puertos_poe" className="block text-sm font-medium text-gray-700">Puertos PoE</label>
                            <select
                                id="puertos_poe"
                                name="puertos_poe"
                                value={formData.puertos_poe}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option value="">Seleccionar</option>
                                <option value="0">0 puertos</option>
                                <option value="4">4 puertos</option>
                                <option value="8">8 puertos</option>
                                <option value="16">16 puertos</option>
                                <option value="24">24 puertos</option>
                                <option value="48">48 puertos</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="alimentacion" className="block text-sm font-medium text-gray-700">Alimentación</label>
                            <select
                                id="alimentacion"
                                name="alimentacion"
                                value={formData.alimentacion}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option value="">Seleccionar</option>
                                <option value="AC">AC</option>
                                <option value="Transformador">Transformador</option>
                                <option value="PoE">PoE</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="puerto_consola"
                                name="puerto_consola"
                                checked={formData.puerto_consola}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="puerto_consola" className="ml-2 block text-sm text-gray-900">Puerto Consola</label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="administrable"
                                name="administrable"
                                checked={formData.administrable}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="administrable" className="ml-2 block text-sm text-gray-900">Administrable</label>
                        </div>
                    </div>
                </div>
            )}

            {assetTypeCategory === 'periferico' && (
                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Especificaciones de Periférico</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="tamano" className="block text-sm font-medium text-gray-700">Tamaño</label>
                            <input
                                type="text"
                                id="tamano"
                                name="tamano"
                                value={formData.tamano}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
                            <input
                                type="text"
                                id="color"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="conectores" className="block text-sm font-medium text-gray-700">Conectores</label>
                            <textarea
                                id="conectores"
                                name="conectores"
                                rows="2"
                                value={formData.conectores}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="cables" className="block text-sm font-medium text-gray-700">Cables</label>
                            <textarea
                                id="cables"
                                name="cables"
                                rows="2"
                                value={formData.cables}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : (isEditing ? 'Actualizar Modelo' : 'Crear Modelo')}
                </button>
            </div>
        </form>
    );
}

export default ModeloActivoForm;