// itam_frontend/src/pages/assets/ActivoFormModal.js

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import {
    createActivo, updateActivo,
    getTiposActivos, getMarcas, getModelosActivo,
    getRegions, getFincas, getDepartamentos, getAreas, getProveedores
} from '../../api';
import { toast } from 'react-toastify';

const ActivoFormModal = ({ show, onClose, onSaveSuccess, activoToEdit }) => {
    const [formData, setFormData] = useState({
        tipo_activo: '',
        proveedor: '',
        marca: '',
        modelo: '',
        serie: '',
        hostname: '',
        fecha_registro: '',
        fecha_fin_garantia: '',
        region: '',
        finca: '',
        departamento: '',
        area: '',
        solicitante: '',
        correo_electronico: '',
        orden_compra: '',
        cuenta_contable: '',
        tipo_costo: '',
        cuotas: '',
        estado: 'activo', // Default to activo for new assets
    });

    const [options, setOptions] = useState({
        tiposActivos: [],
        proveedores: [],
        marcas: [],
        modelos: [],
        regions: [],
        fincas: [],
        departamentos: [],
        areas: [],
    });

    const [filteredOptions, setFilteredOptions] = useState({
        modelos: [],
        fincas: [],
        areas: [],
    });

    const [selectedModel, setSelectedModel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (show) {
            fetchOptions();
        }
    }, [show]);

    useEffect(() => {
        if (activoToEdit) {
            setFormData({
                tipo_activo: activoToEdit.tipo_activo_id || '',
                proveedor: activoToEdit.proveedor_id || '',
                marca: activoToEdit.marca_id || '',
                modelo: activoToEdit.modelo_id || '',
                serie: activoToEdit.serie || '',
                hostname: activoToEdit.hostname || '',
                fecha_registro: activoToEdit.fecha_registro || '',
                fecha_fin_garantia: activoToEdit.fecha_fin_garantia || '',
                region: activoToEdit.region_id || '',
                finca: activoToEdit.finca_id || '',
                departamento: activoToEdit.departamento_id || '',
                area: activoToEdit.area_id || '',
                solicitante: activoToEdit.solicitante || '',
                correo_electronico: activoToEdit.correo_electronico || '',
                orden_compra: activoToEdit.orden_compra || '',
                cuenta_contable: activoToEdit.cuenta_contable || '',
                tipo_costo: activoToEdit.tipo_costo || '',
                cuotas: activoToEdit.cuotas ? activoToEdit.cuotas.toString() : '',
                moneda: activoToEdit.moneda || '',
                costo: activoToEdit.costo || '',
                estado: activoToEdit.estado || 'activo',
            });
            // Set selected model for description
            if (activoToEdit.modelo_id && options.modelos && options.modelos.length > 0) {
                const model = options.modelos.find(m => m.id === activoToEdit.modelo_id);
                setSelectedModel(model);
            }
        } else {
            setFormData({
                tipo_activo: '',
                proveedor: '',
                marca: '',
                modelo: '',
                serie: '',
                hostname: '',
                fecha_registro: '',
                fecha_fin_garantia: '',
                region: '',
                finca: '',
                departamento: '',
                area: '',
                solicitante: '',
                correo_electronico: '',
                orden_compra: '',
                cuenta_contable: '',
                tipo_costo: '',
                cuotas: '',
                moneda: '',
                costo: '',
                estado: 'activo',
            });
            setSelectedModel(null);
        }
    }, [activoToEdit, options.modelos]);

    // Filter modelos when tipo_activo or marca changes
    useEffect(() => {
        if (formData.tipo_activo && formData.marca && options.modelos && options.modelos.length > 0) {
            const filtered = options.modelos.filter(modelo =>
                modelo.tipo_activo_id === parseInt(formData.tipo_activo) &&
                modelo.marca_id === parseInt(formData.marca)
            );
            setFilteredOptions(prev => ({ ...prev, modelos: filtered }));
        } else {
            setFilteredOptions(prev => ({ ...prev, modelos: [] }));
        }
    }, [formData.tipo_activo, formData.marca, options.modelos]);

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
        if (formData.departamento) {
            const filtered = options.areas.filter(area => area.departamento_id === parseInt(formData.departamento));
            setFilteredOptions(prev => ({ ...prev, areas: filtered }));
        } else {
            setFilteredOptions(prev => ({ ...prev, areas: [] }));
        }
    }, [formData.departamento, options.areas]);

    const fetchOptions = async () => {
        try {
            const [
                tiposRes, proveedoresRes, marcasRes, modelosRes,
                regionsRes, fincasRes, deptosRes, areasRes
            ] = await Promise.all([
                getTiposActivos({ page_size: 1000 }),
                getProveedores({ page_size: 1000 }),
                getMarcas({ page_size: 1000 }),
                getModelosActivo({ page_size: 1000 }),
                getRegions({ page_size: 1000 }),
                getFincas({ page_size: 1000 }),
                getDepartamentos({ page_size: 1000 }),
                getAreas({ page_size: 1000 }),
            ]);

            setOptions({
                tiposActivos: tiposRes.data.results || tiposRes.data || [],
                proveedores: proveedoresRes.data.results || proveedoresRes.data || [],
                marcas: marcasRes.data.results || marcasRes.data || [],
                modelos: modelosRes.data.results || modelosRes.data || [],
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear errors
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        // Handle model selection for description
        if (name === 'modelo') {
            const model = options.modelos.find(m => m.id === parseInt(value));
            setSelectedModel(model);
        }

        // Handle tipo_costo change: clear cuotas if not mensualidad
        if (name === 'tipo_costo' && value !== 'mensualidad') {
            setFormData(prev => ({ ...prev, cuotas: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.tipo_activo) newErrors.tipo_activo = 'Tipo de Equipo es obligatorio.';
        if (!formData.proveedor) newErrors.proveedor = 'Proveedor es obligatorio.';
        if (!formData.marca) newErrors.marca = 'Marca es obligatoria.';
        if (!formData.modelo) newErrors.modelo = 'Modelo es obligatorio.';
        if (!formData.serie) newErrors.serie = 'Serie es obligatoria.';
        if (!formData.hostname) newErrors.hostname = 'Hostname es obligatorio.';
        if (!formData.fecha_registro) newErrors.fecha_registro = 'Fecha de registro es obligatoria.';
        if (!formData.fecha_fin_garantia) newErrors.fecha_fin_garantia = 'Fecha de fin de garantía es obligatoria.';
        if (!formData.region) newErrors.region = 'Región es obligatoria.';
        if (!formData.finca) newErrors.finca = 'Finca es obligatoria.';
        if (!formData.departamento) newErrors.departamento = 'Departamento es obligatorio.';
        if (!formData.area) newErrors.area = 'Área es obligatoria.';
        // solicitante, correo_electronico, and orden_compra are now optional
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
            // Prepare data for submission, converting empty strings to null for optional fields
            const submitData = { ...formData };

            // Convert empty strings to null for optional choice fields
            if (!submitData.tipo_costo || submitData.tipo_costo === '') {
                submitData.tipo_costo = null;
            }
            if (!submitData.cuotas || submitData.cuotas === '') {
                submitData.cuotas = null;
            } else {
                submitData.cuotas = parseInt(submitData.cuotas, 10);
            }
            if (!submitData.moneda || submitData.moneda === '') {
                submitData.moneda = null;
            }
            if (!submitData.costo || submitData.costo === '') {
                submitData.costo = null;
            } else {
                submitData.costo = parseFloat(submitData.costo);
            }
            if (!submitData.cuenta_contable || submitData.cuenta_contable === '') {
                submitData.cuenta_contable = null;
            }
            if (!submitData.solicitante || submitData.solicitante === '') {
                submitData.solicitante = null;
            }
            if (!submitData.correo_electronico || submitData.correo_electronico === '') {
                submitData.correo_electronico = null;
            }
            if (!submitData.orden_compra || submitData.orden_compra === '') {
                submitData.orden_compra = null;
            }

            if (activoToEdit) {
                await updateActivo(activoToEdit.id, submitData);
                toast.success('Activo actualizado exitosamente!');
            } else {
                await createActivo(submitData);
                toast.success('Activo creado exitosamente!');
            }
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving activo:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.detail || 'Error al guardar el activo.';
            toast.error(errorMsg);
            setErrors(error.response?.data || {});
        } finally {
            setLoading(false);
        }
    };

    const renderModelDescription = () => {
        if (!selectedModel) return null;

        const category = selectedModel.asset_type_category || 'periferico';
        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Especificaciones del Modelo:</h4>
                {category === 'computo' && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Procesador:</strong> {selectedModel.procesador || 'N/A'}</p>
                        <p><strong>RAM:</strong> {selectedModel.ram ? `${selectedModel.ram} GB` : 'N/A'}</p>
                        <p><strong>Almacenamiento:</strong> {selectedModel.almacenamiento || 'N/A'}</p>
                        <p><strong>Tarjeta Gráfica:</strong> {selectedModel.tarjeta_grafica || 'N/A'}</p>
                        <p><strong>WIFI:</strong> {Boolean(selectedModel.wifi) ? 'Sí' : 'No'}</p>
                        <p><strong>Ethernet:</strong> {Boolean(selectedModel.ethernet) ? 'Sí' : 'No'}</p>
                    </div>
                )}
                {category === 'red' && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Puertos Ethernet:</strong> {selectedModel.puertos_ethernet || 'N/A'}</p>
                        <p><strong>Puertos SFP:</strong> {selectedModel.puertos_sfp || 'N/A'}</p>
                        <p><strong>Puerto Consola:</strong> {Boolean(selectedModel.puerto_consola) ? 'Sí' : 'No'}</p>
                        <p><strong>Puertos PoE:</strong> {selectedModel.puertos_poe || 'N/A'}</p>
                        <p><strong>Alimentación:</strong> {selectedModel.alimentacion || 'N/A'}</p>
                        <p><strong>Administrable:</strong> {Boolean(selectedModel.administrable) ? 'Sí' : 'No'}</p>
                    </div>
                )}
                {category === 'periferico' && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Tamaño:</strong> {selectedModel.tamano || 'N/A'}</p>
                        <p><strong>Color:</strong> {selectedModel.color || 'N/A'}</p>
                        <p><strong>Conectores:</strong> {selectedModel.conectores || 'N/A'}</p>
                        <p><strong>Cables:</strong> {selectedModel.cables || 'N/A'}</p>
                    </div>
                )}
            </div>
        );
    };

    // Show loading state while fetching options
    if (!options.tiposActivos || options.tiposActivos.length === 0) {
        return (
            <Modal show={show} onClose={onClose} title={activoToEdit ? "Editar Activo" : "Crear Activo"} size="large">
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500">Cargando opciones...</div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal show={show} onClose={onClose} title={activoToEdit ? "Editar Activo" : "Crear Activo"} size="xl">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información Básica */}
                <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Básica</h3>
                    <div className="grid grid-cols-3 gap-6">
                        {/* Tipo de Equipo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Equipo *</label>
                            <select
                                name="tipo_activo"
                                value={formData.tipo_activo}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            >
                                <option value="">Seleccionar...</option>
                                {options.tiposActivos && options.tiposActivos.map(tipo => (
                                    <option key={tipo.id} value={tipo.id}>{tipo.name}</option>
                                ))}
                            </select>
                            {errors.tipo_activo && <p className="mt-1 text-sm text-red-600">{errors.tipo_activo}</p>}
                        </div>

                        {/* Proveedor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor *</label>
                            <select
                                name="proveedor"
                                value={formData.proveedor}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            >
                                <option value="">Seleccionar...</option>
                                {options.proveedores && options.proveedores.map(prov => (
                                    <option key={prov.id} value={prov.id}>{prov.nombre_empresa}</option>
                                ))}
                            </select>
                            {errors.proveedor && <p className="mt-1 text-sm text-red-600">{errors.proveedor}</p>}
                        </div>

                        {/* Marca */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                            <select
                                name="marca"
                                value={formData.marca}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            >
                                <option value="">Seleccionar...</option>
                                {options.marcas && options.marcas.map(marca => (
                                    <option key={marca.id} value={marca.id}>{marca.name}</option>
                                ))}
                            </select>
                            {errors.marca && <p className="mt-1 text-sm text-red-600">{errors.marca}</p>}
                        </div>

                        {/* Modelo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                            <select
                                name="modelo"
                                value={formData.modelo}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                disabled={!formData.tipo_activo || !formData.marca}
                            >
                                <option value="">
                                    {formData.tipo_activo && formData.marca ? 'Seleccionar...' : 'Seleccione Tipo y Marca primero'}
                                </option>
                                {filteredOptions.modelos && filteredOptions.modelos.map(modelo => (
                                    <option key={modelo.id} value={modelo.id}>{modelo.name}</option>
                                ))}
                            </select>
                            {errors.modelo && <p className="mt-1 text-sm text-red-600">{errors.modelo}</p>}
                        </div>

                        {/* Serie */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Serie *</label>
                            <input
                                type="text"
                                name="serie"
                                value={formData.serie}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {errors.serie && <p className="mt-1 text-sm text-red-600">{errors.serie}</p>}
                        </div>

                        {/* Hostname */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hostname *</label>
                            <input
                                type="text"
                                name="hostname"
                                value={formData.hostname}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {errors.hostname && <p className="mt-1 text-sm text-red-600">{errors.hostname}</p>}
                        </div>
                    </div>
                </div>

                {/* Información de Control */}
                <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Control</h3>
                    <div className="grid grid-cols-3 gap-6">
                        {/* Fecha de registro */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Registro *</label>
                            <input
                                type="date"
                                name="fecha_registro"
                                value={formData.fecha_registro}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {errors.fecha_registro && <p className="mt-1 text-sm text-red-600">{errors.fecha_registro}</p>}
                        </div>

                        {/* Fecha de fin de garantia */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin de Garantía *</label>
                            <input
                                type="date"
                                name="fecha_fin_garantia"
                                value={formData.fecha_fin_garantia}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {errors.fecha_fin_garantia && <p className="mt-1 text-sm text-red-600">{errors.fecha_fin_garantia}</p>}
                        </div>

                        {/* Region */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Región *</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Finca *</label>
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

                        {/* Departamento */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Departamento *</label>
                            <select
                                name="departamento"
                                value={formData.departamento}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            >
                                <option value="">Seleccionar...</option>
                                {options.departamentos && options.departamentos.map(depto => (
                                    <option key={depto.id} value={depto.id}>{depto.name}</option>
                                ))}
                            </select>
                            {errors.departamento && <p className="mt-1 text-sm text-red-600">{errors.departamento}</p>}
                        </div>

                        {/* Area */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Área *</label>
                            <select
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                disabled={!formData.departamento}
                            >
                                <option value="">
                                    {formData.departamento ? 'Seleccionar...' : 'Seleccione Departamento primero'}
                                </option>
                                {filteredOptions.areas && filteredOptions.areas.map(area => (
                                    <option key={area.id} value={area.id}>{area.name}</option>
                                ))}
                            </select>
                            {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
                        </div>
                    </div>
                </div>

                {/* Especificaciones */}
                <div className="pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Especificaciones</h3>
                    <div className="grid grid-cols-3 gap-6">
                        {/* Solicitante */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Solicitante</label>
                            <input
                                type="text"
                                name="solicitante"
                                value={formData.solicitante}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {errors.solicitante && <p className="mt-1 text-sm text-red-600">{errors.solicitante}</p>}
                        </div>

                        {/* Correo Electronico */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                            <input
                                type="email"
                                name="correo_electronico"
                                value={formData.correo_electronico}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {errors.correo_electronico && <p className="mt-1 text-sm text-red-600">{errors.correo_electronico}</p>}
                        </div>

                        {/* Orden de Compra */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Orden de Compra</label>
                            <input
                                type="text"
                                name="orden_compra"
                                value={formData.orden_compra}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {errors.orden_compra && <p className="mt-1 text-sm text-red-600">{errors.orden_compra}</p>}
                        </div>
                    </div>
                </div>

                {/* Información Financiera */}
                <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Financiera</h3>
                    <div className="grid grid-cols-3 gap-6">
                        {/* Cuenta Contable */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cuenta Contable</label>
                            <input
                                type="text"
                                name="cuenta_contable"
                                value={formData.cuenta_contable}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {errors.cuenta_contable && <p className="mt-1 text-sm text-red-600">{errors.cuenta_contable}</p>}
                        </div>

                        {/* Tipo de Costo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Costo</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="tipo_costo"
                                        value="costo"
                                        checked={formData.tipo_costo === 'costo'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-400"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Costo</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="tipo_costo"
                                        value="mensualidad"
                                        checked={formData.tipo_costo === 'mensualidad'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-400"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Mensualidad</span>
                                </label>
                            </div>
                            {errors.tipo_costo && <p className="mt-1 text-sm text-red-600">{errors.tipo_costo}</p>}
                        </div>

                        {/* Cuotas */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cuotas</label>
                            <select
                                name="cuotas"
                                value={formData.cuotas}
                                onChange={handleChange}
                                disabled={formData.tipo_costo !== 'mensualidad'}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="1">1 mes</option>
                                <option value="3">3 meses</option>
                                <option value="6">6 meses</option>
                                <option value="12">12 meses</option>
                                <option value="18">18 meses</option>
                                <option value="24">24 meses</option>
                                <option value="36">36 meses</option>
                                <option value="48">48 meses</option>
                                <option value="60">60 meses</option>
                            </select>
                            {errors.cuotas && <p className="mt-1 text-sm text-red-600">{errors.cuotas}</p>}
                        </div>

                        {/* Moneda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                            <select
                                name="moneda"
                                value={formData.moneda}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="USD">Dólares</option>
                                <option value="GTQ">Quetzales</option>
                            </select>
                            {errors.moneda && <p className="mt-1 text-sm text-red-600">{errors.moneda}</p>}
                        </div>

                        {/* Costo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Costo</label>
                            <input
                                type="number"
                                step="0.01"
                                name="costo"
                                value={formData.costo}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white border-gray-400 shadow-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {errors.costo && <p className="mt-1 text-sm text-red-600">{errors.costo}</p>}
                        </div>
                    </div>
                </div>

                {/* Model Description */}
                {renderModelDescription()}

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
        </Modal>
    );
};

export default ActivoFormModal;