/**
 * Modal Interactivo de Documentación API.
 *
 * Interfaz completa para probar y documentar endpoints de la API REST.
 * Incluye ejecución de requests en tiempo real, visualización de respuestas,
 * generación de comandos cURL y plantillas de datos de ejemplo.
 *
 * Características principales:
 * - Pruebas interactivas de endpoints con autenticación JWT
 * - Visualización de respuestas JSON con formato
 * - Generación automática de comandos cURL
 * - Plantillas de datos de ejemplo por endpoint
 * - Manejo especial del endpoint de login
 * - Copiado al portapapeles de requests/responses
 * - Estados de carga y manejo de errores completo
 * - Diseño responsive con tabs organizados
 */

import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faCode, faEye, faCopy, faCheck, faServer, faDatabase, faUsers, faKey } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import api from '../api';
import { toast } from 'react-toastify';

const APIDetailModal = ({ show, onClose, endpoint }) => {
    const [activeTab, setActiveTab] = useState('interactive');
    const [testParams, setTestParams] = useState({});
    const [testBody, setTestBody] = useState('');
    const [testResponse, setTestResponse] = useState(null);
    const [testLoading, setTestLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (show && endpoint) {
            initializeTestParams();
        }
    }, [show, endpoint]);

    const initializeTestParams = () => {
        const params = {};
        const urlParts = endpoint.url.split('/');

        // Extract path parameters (like {id})
        urlParts.forEach(part => {
            if (part.startsWith('{') && part.endsWith('}')) {
                const paramName = part.slice(1, -1);
                params[paramName] = '';
            }
        });

        // Initialize query parameters for GET requests
        if (endpoint.method === 'GET') {
            params.page = '1';
            params.page_size = '10';
        }

        setTestParams(params);

        // Initialize request body based on endpoint
        let initialBody = '{}';
        if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
            initialBody = getInitialRequestBody(endpoint);
        }

        setTestBody(initialBody);
        setTestResponse(null);
    };

    const getInitialRequestBody = (endpoint) => {
        // Define common request body structures based on endpoint patterns
        const bodyTemplates = {
            // Authentication
            '/api/login/': JSON.stringify({
                "username": "usuario",
                "password": "contraseña"
            }, null, 2),

            // Users
            '/api/users/': JSON.stringify({
                "username": "nuevo_usuario",
                "email": "usuario@ejemplo.com",
                "first_name": "Nombre",
                "last_name": "Apellido",
                "password": "contraseña_segura",
                "region": 1,
                "departamento": 1,
                "area": 1,
                "is_active": true
            }, null, 2),

            // Master Data - Regions
            '/api/masterdata/regions/': JSON.stringify({
                "name": "Nueva Región",
                "description": "Descripción de la región"
            }, null, 2),

            // Master Data - Farms
            '/api/masterdata/fincas/': JSON.stringify({
                "name": "Nueva Finca",
                "region": 1,
                "description": "Descripción de la finca"
            }, null, 2),

            // Master Data - Departments
            '/api/masterdata/departamentos/': JSON.stringify({
                "name": "Nuevo Departamento",
                "finca": 1,
                "description": "Descripción del departamento"
            }, null, 2),

            // Master Data - Areas
            '/api/masterdata/areas/': JSON.stringify({
                "name": "Nueva Área",
                "departamento": 1,
                "description": "Descripción del área"
            }, null, 2),

            // Master Data - Asset Types
            '/api/masterdata/tipos-activos/': JSON.stringify({
                "name": "Nuevo Tipo de Activo",
                "category": "computo",
                "description": "Descripción del tipo de activo"
            }, null, 2),

            // Master Data - Brands
            '/api/masterdata/marcas/': JSON.stringify({
                "name": "Nueva Marca",
                "description": "Descripción de la marca"
            }, null, 2),

            // Master Data - Models
            '/api/masterdata/modelos-activo/': JSON.stringify({
                "name": "Nuevo Modelo",
                "marca": 1,
                "tipo_activo": 1,
                "procesador": "Intel i5",
                "ram": 8,
                "almacenamiento": "256GB SSD",
                "descripcion": "Descripción del modelo"
            }, null, 2),

            // Master Data - Suppliers
            '/api/masterdata/proveedores/': JSON.stringify({
                "name": "Nuevo Proveedor",
                "contact_person": "Persona de Contacto",
                "email": "contacto@proveedor.com",
                "phone": "+502 1234 5678",
                "address": "Dirección del proveedor"
            }, null, 2),

            // Assets
            '/api/assets/activos/': JSON.stringify({
                "hostname": "PC001",
                "serie": "SN123456",
                "tipo_activo": 1,
                "marca": 1,
                "modelo": 1,
                "proveedor": 1,
                "region": 1,
                "finca": 1,
                "departamento": 1,
                "area": 1,
                "fecha_registro": "2024-01-01",
                "fecha_fin_garantia": "2025-01-01",
                "costo": 1000.00,
                "moneda": "GTQ",
                "cuotas": 1,
                "tipo_costo": "costo",
                "solicitante": "Juan Pérez",
                "correo_electronico": "juan.perez@empresa.com",
                "orden_compra": "OC-001",
                "cuenta_contable": "12345"
            }, null, 2),

            // Maintenance
            '/api/assets/maintenances/': JSON.stringify({
                "activo": 1,
                "maintenance_date": "2024-01-01",
                "technician_name": "Técnico Responsable",
                "findings": "Hallazgos del mantenimiento",
                "next_maintenance_date": "2024-06-01"
            }, null, 2),

            // Assignments
            '/api/assets/assignments/': JSON.stringify({
                "activo": 1,
                "employee": 1,
                "assigned_date": "2024-01-01"
            }, null, 2),

            // Employees
            '/api/employees/employees/': JSON.stringify({
                "first_name": "Juan",
                "last_name": "Pérez",
                "email": "juan.perez@empresa.com",
                "employee_number": "EMP001",
                "region": 1,
                "departamento": 1,
                "area": 1,
                "position": "Analista",
                "hire_date": "2024-01-01",
                "is_active": true
            }, null, 2),

            // Roles
            '/api/roles/': JSON.stringify({
                "name": "Nuevo Rol",
                "description": "Descripción del rol"
            }, null, 2)
        };

        return bodyTemplates[endpoint.url] || '{}';
    };

    const handleParamChange = (paramName, value) => {
        setTestParams(prev => ({
            ...prev,
            [paramName]: value
        }));
    };

    const buildRequestUrl = () => {
        let url = endpoint.url;
        // Replace path parameters
        Object.entries(testParams).forEach(([key, value]) => {
            if (url.includes(`{${key}}`)) {
                url = url.replace(`{${key}}`, value || '1');
            }
        });

        // Add query parameters for GET requests
        if (endpoint.method === 'GET') {
            const queryParams = [];
            Object.entries(testParams).forEach(([key, value]) => {
                if (!url.includes(`{${key}}`) && value) {
                    queryParams.push(`${key}=${encodeURIComponent(value)}`);
                }
            });
            if (queryParams.length > 0) {
                url += (url.includes('?') ? '&' : '?') + queryParams.join('&');
            }
        }

        // For login endpoint, use full URL, for others use relative path (without /api/ prefix)
        if (endpoint.url === '/api/login/') {
            return `${window.location.origin}${url}`;
        }
        // Remove /api/ prefix for other endpoints since axios baseURL already includes it
        return url.replace('/api/', '');
    };

    const executeTest = async () => {
        setTestLoading(true);
        setTestResponse(null);

        try {
            const url = buildRequestUrl();
            let config = {};

            // Special handling for login endpoint - don't use authenticated API
            if (endpoint.url === '/api/login/') {
                // Use axios directly without authentication for login
                const loginConfig = {
                    method: endpoint.method,
                    url: url, // url is already built by buildRequestUrl()
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };

                if (testBody) {
                    try {
                        loginConfig.data = JSON.parse(testBody);
                    } catch (e) {
                        toast.error('JSON inválido en el body');
                        setTestLoading(false);
                        return;
                    }
                }

                const startTime = Date.now();
                const response = await axios(loginConfig);
                const endTime = Date.now();

                // If login successful, save tokens and show success
                if (response.data.access && response.data.refresh) {
                    // Save tokens to localStorage
                    localStorage.setItem('access_token', response.data.access);
                    localStorage.setItem('refresh_token', response.data.refresh);

                    setTestResponse({
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                        data: {
                            ...response.data,
                            _note: "¡Login exitoso! Los tokens se han guardado automáticamente. Ahora puedes usar otros endpoints con autenticación.",
                            _tokens: {
                                access_token: response.data.access.substring(0, 20) + "...",
                                refresh_token: response.data.refresh.substring(0, 20) + "..."
                            }
                        },
                        duration: endTime - startTime,
                        success: true
                    });

                    toast.success(`Login exitoso - tokens guardados`);
                } else {
                    setTestResponse({
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                        data: response.data,
                        duration: endTime - startTime,
                        success: true
                    });

                    toast.success(`Request exitoso (${response.status})`);
                }
            } else {
                // Normal authenticated request
                // Add body for POST/PUT requests
                if ((endpoint.method === 'POST' || endpoint.method === 'PUT') && testBody) {
                    try {
                        config.data = JSON.parse(testBody);
                    } catch (e) {
                        toast.error('JSON inválido en el body');
                        setTestLoading(false);
                        return;
                    }
                }

                const startTime = Date.now();
                const response = await api.request({
                    method: endpoint.method,
                    url: url,
                    ...config
                });
                const endTime = Date.now();

                setTestResponse({
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    data: response.data,
                    duration: endTime - startTime,
                    success: true
                });

                toast.success(`Request exitoso (${response.status})`);
            }
        } catch (error) {
            const endTime = Date.now();
            const startTime = Date.now();

            setTestResponse({
                status: error.response?.status || 'Error',
                statusText: error.response?.statusText || error.message,
                headers: error.response?.headers || {},
                data: error.response?.data || { error: error.message },
                duration: endTime - startTime,
                success: false
            });

            toast.error(`Error en el request: ${error.response?.status || error.message}`);
        } finally {
            setTestLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getMethodColor = (method) => {
        switch (method) {
            case 'GET': return 'bg-green-500 text-white';
            case 'POST': return 'bg-blue-500 text-white';
            case 'PUT': return 'bg-yellow-500 text-white';
            case 'DELETE': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getStatusColor = (status) => {
        if (typeof status === 'number') {
            if (status >= 200 && status < 300) return 'text-green-600';
            if (status >= 400 && status < 500) return 'text-orange-600';
            if (status >= 500) return 'text-red-600';
        }
        return 'text-red-600';
    };

    const formatJson = (obj) => {
        return JSON.stringify(obj, null, 2);
    };

    if (!endpoint) return null;

    return (
        <Modal show={show} onClose={onClose} title={`${endpoint.method} ${endpoint.url}`} size="2xl">
            <div className="flex flex-col h-full">
                {/* Header with Method Badge */}
                <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 text-sm font-bold rounded ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                        </span>
                        <span className="text-lg font-mono text-gray-800">{endpoint.url}</span>
                    </div>
                    <p className="text-gray-600">{endpoint.description}</p>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('interactive')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'interactive'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <FontAwesomeIcon icon={faPlay} className="mr-2" />
                            Interactive API
                        </button>
                        <button
                            onClick={() => setActiveTab('raw')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'raw'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <FontAwesomeIcon icon={faCode} className="mr-2" />
                            Raw Data
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'interactive' && (
                        <div className="space-y-6">
                            {/* Parameters Section */}
                            {Object.keys(testParams).length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Parameters</h3>
                                    <div className="space-y-4">
                                        {Object.entries(testParams).map(([paramName, value]) => (
                                            <div key={paramName} className="flex items-center space-x-4">
                                                <label className="text-sm font-medium text-gray-700 min-w-0 flex-shrink-0 w-32">
                                                    {paramName}:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) => handleParamChange(paramName, e.target.value)}
                                                    placeholder={`Enter ${paramName}`}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                />
                                                {endpoint.url.includes(`{${paramName}}`) && (
                                                    <span className="text-xs text-red-500">Required</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Request Body */}
                            {(endpoint.method === 'POST' || endpoint.method === 'PUT') && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Body</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Content-Type: application/json</span>
                                            <button
                                                onClick={() => copyToClipboard(testBody)}
                                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                            >
                                                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="mr-1" />
                                                {copied ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>

                                        {/* Special handling for login endpoint */}
                                        {endpoint.url === '/api/login/' ? (
                                            <div className="space-y-3">
                                                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                                    <p className="text-sm text-blue-800 mb-2">
                                                        <strong>Nota:</strong> Este es el endpoint de login. Ingresa tus credenciales para obtener tokens JWT.
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                                            <input
                                                                type="text"
                                                                placeholder="usuario@empresa.com"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                                onChange={(e) => {
                                                                    const currentBody = JSON.parse(testBody || '{}');
                                                                    currentBody.username = e.target.value;
                                                                    setTestBody(JSON.stringify(currentBody, null, 2));
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                                            <input
                                                                type="password"
                                                                placeholder="tu_password"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                                onChange={(e) => {
                                                                    const currentBody = JSON.parse(testBody || '{}');
                                                                    currentBody.password = e.target.value;
                                                                    setTestBody(JSON.stringify(currentBody, null, 2));
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={testBody}
                                                    onChange={(e) => setTestBody(e.target.value)}
                                                    placeholder='{"username": "user@example.com", "password": "yourpassword"}'
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                                />
                                            </div>
                                        ) : (
                                            <textarea
                                                value={testBody}
                                                onChange={(e) => setTestBody(e.target.value)}
                                                placeholder='{"key": "value"}'
                                                rows={8}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Execute Button */}
                            <div className="flex justify-center py-4">
                                <button
                                    onClick={executeTest}
                                    disabled={testLoading}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
                                >
                                    <FontAwesomeIcon icon={faPlay} />
                                    <span>{testLoading ? 'Sending...' : 'Send Request'}</span>
                                </button>
                            </div>

                            {/* Response Section */}
                            {testResponse && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Response</h3>

                                    {/* Status Line */}
                                    <div className="mb-4 p-3 bg-gray-50 rounded border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <span className="text-sm font-medium text-gray-700">Status:</span>
                                                <span className={`text-lg font-bold ${getStatusColor(testResponse.status)}`}>
                                                    {testResponse.status} {testResponse.statusText}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {testResponse.duration}ms
                                            </span>
                                        </div>
                                    </div>

                                    {/* Response Headers */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-md font-medium text-gray-700">Response Headers</h4>
                                            <button
                                                onClick={() => copyToClipboard(JSON.stringify(testResponse.headers, null, 2))}
                                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                            >
                                                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="mr-1" />
                                                {copied ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto max-h-32">
                                            {JSON.stringify(testResponse.headers, null, 2)}
                                        </pre>
                                    </div>

                                    {/* Response Body */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-md font-medium text-gray-700">Response Body</h4>
                                            <button
                                                onClick={() => copyToClipboard(formatJson(testResponse.data))}
                                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                            >
                                                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="mr-1" />
                                                {copied ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                        <pre className={`p-4 rounded text-sm overflow-x-auto max-h-96 ${
                                            testResponse.success ? 'bg-gray-900 text-green-400' : 'bg-red-900 text-red-200'
                                        }`}>
                                            {formatJson(testResponse.data)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'raw' && (
                        <div className="space-y-6">
                            {/* Raw Request */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Raw HTTP Request</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Generated cURL command</span>
                                        <button
                                            onClick={() => copyToClipboard(`curl -X ${endpoint.method} "${window.location.origin}/api${buildRequestUrl()}" -H "Authorization: Bearer YOUR_TOKEN" ${(endpoint.method === 'POST' || endpoint.method === 'PUT') && testBody ? `-d '${testBody}'` : ''}`)}
                                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                            <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="mr-1" />
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`curl -X ${endpoint.method} "${window.location.origin}${endpoint.url}" \\
 -H "Authorization: Bearer YOUR_TOKEN" \\
 -H "Content-Type: application/json"${(endpoint.method === 'POST' || endpoint.method === 'PUT') && testBody ? ` \\
 -d '${testBody}'` : ''}`}
                                    </pre>
                                </div>
                            </div>

                            {/* Request Details */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Method:</span>
                                        <p className="text-sm text-gray-900 mt-1">{endpoint.method}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">URL:</span>
                                        <p className="text-sm font-mono text-gray-900 mt-1 break-all">{window.location.origin}{endpoint.url}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-sm font-medium text-gray-600">Headers:</span>
                                        <pre className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">
{`Authorization: Bearer YOUR_TOKEN
Content-Type: application/json`}
                                        </pre>
                                    </div>
                                    {(endpoint.method === 'POST' || endpoint.method === 'PUT') && (
                                        <div className="col-span-2">
                                            <span className="text-sm font-medium text-gray-600">Body:</span>
                                            <pre className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">
                                                {testBody || 'No body'}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default APIDetailModal;