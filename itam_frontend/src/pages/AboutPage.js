import React from 'react';

function AboutPage() {
    const systemInfo = {
        name: 'ITAM System',
        description: 'IT Asset Management System',
        version: '1.0.0'
    };

    const backendTechnologies = [
        { name: 'asgiref', version: '3.9.1' },
        { name: 'Django', version: '5.2.4' },
        { name: 'django-cors-headers', version: '4.7.0' },
        { name: 'djangorestframework', version: '3.16.0' },
        { name: 'djangorestframework-simplejwt', version: '5.5.0' },
        { name: 'mysqlclient', version: '2.2.7' },
        { name: 'PyJWT', version: '2.9.0' },
        { name: 'sqlparse', version: '0.5.3' },
        { name: 'tzdata', version: '2025.2' },
        { name: 'django-filter', version: '24.3' }
    ];

    const frontendTechnologies = [
        { name: '@fortawesome/fontawesome-svg-core', version: '^6.7.2' },
        { name: '@fortawesome/free-solid-svg-icons', version: '^6.7.2' },
        { name: '@fortawesome/react-fontawesome', version: '^0.2.2' },
        { name: 'axios', version: '^1.11.0' },
        { name: 'chart.js', version: '^4.5.0' },
        { name: 'cra-template-tailwindcss', version: '4.0.1' },
        { name: 'jwt-decode', version: '^4.0.0' },
        { name: 'lodash', version: '^4.17.21' },
        { name: 'react', version: '^19.1.0' },
        { name: 'react-chartjs-2', version: '^5.3.0' },
        { name: 'react-dom', version: '^19.1.0' },
        { name: 'react-pdf', version: '^10.1.0' },
        { name: 'react-router-dom', version: '^7.7.0' },
        { name: 'react-scripts', version: '5.0.1' },
        { name: 'react-toastify', version: '^11.0.5' },
        { name: 'web-vitals', version: '^5.0.3' }
    ];

    return (
        <div className="w-full p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Acerca de ITAM System</h1>

                {/* System Information - Full Width */}
                <div className="mb-12 bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-3xl font-semibold mb-6 text-gray-700 text-center">Información del Sistema</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <h3 className="text-xl font-medium text-gray-600 mb-2">Nombre</h3>
                            <p className="text-2xl font-bold text-blue-600">{systemInfo.name}</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-medium text-gray-600 mb-2">Descripción</h3>
                            <p className="text-lg text-gray-800">{systemInfo.description}</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-medium text-gray-600 mb-2">Versión</h3>
                            <p className="text-2xl font-bold text-green-600">{systemInfo.version}</p>
                        </div>
                    </div>
                </div>

                {/* Technologies - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Backend */}
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h3 className="text-2xl font-semibold mb-6 text-center text-blue-700">Backend Tecnologías (Django)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {backendTechnologies.map((tech, index) => (
                                <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                                    <div className="font-medium text-blue-800">{tech.name}</div>
                                    <div className="text-sm text-blue-600">v{tech.version}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Frontend */}
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h3 className="text-2xl font-semibold mb-6 text-center text-green-700">Frontend Tecnologías (React)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {frontendTechnologies.map((tech, index) => (
                                <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                                    <div className="font-medium text-green-800">{tech.name}</div>
                                    <div className="text-sm text-green-600">{tech.version}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutPage;