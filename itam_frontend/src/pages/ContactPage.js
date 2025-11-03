/**
 * Página de Contacto.
 *
 * Página informativa con información de contacto del equipo de soporte
 * del sistema ITAM. Incluye datos de contacto, departamento responsable
 * y mensaje motivacional para contactar al soporte.
 *
 * Características principales:
 * - Información de contacto clara y accesible
 * - Enlaces directos a email y teléfono
 * - Diseño responsive centrado
 * - Mensaje motivacional para contactar soporte
 * - Información del departamento responsable
 */

import React from 'react';

function ContactPage() {
    const contactInfo = {
        email: 'soporte@naturaceites.com',
        phone: '+502 2328-5200',
        department: 'Área de Soporte'
    };

    return (
        <div className="w-full p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Contacto</h1>

                {/* Contact Message */}
                <div className="mb-12 bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">¿Necesitas Ayuda?</h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Si tienes alguna pregunta, problema técnico o necesitas soporte con el sistema ITAM,
                        no dudes en contactarnos. Nuestro equipo de soporte está aquí para ayudarte.
                    </p>
                    <p className="text-lg text-gray-600">
                        Estamos disponibles para resolver tus consultas y asegurar que el sistema funcione correctamente.
                    </p>
                </div>

                {/* Contact Information */}
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">Información de Contacto</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                <h3 className="text-xl font-medium text-blue-700 mb-2">Correo Electrónico</h3>
                                <a
                                    href={`mailto:${contactInfo.email}`}
                                    className="text-lg text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    {contactInfo.email}
                                </a>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                                <h3 className="text-xl font-medium text-green-700 mb-2">Teléfono</h3>
                                <a
                                    href={`tel:${contactInfo.phone}`}
                                    className="text-lg text-green-600 hover:text-green-800 hover:underline"
                                >
                                    {contactInfo.phone}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-lg text-gray-600">
                            <strong>Departamento:</strong> {contactInfo.department}
                        </p>
                    </div>
                </div>

                {/* Additional Message */}
                <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
                    <p className="text-lg text-blue-800">
                        ¡No esperes! Contáctanos hoy mismo y obtén la asistencia que necesitas para mantener
                        tu sistema ITAM funcionando de manera óptima.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;