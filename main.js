document.addEventListener('DOMContentLoaded', () => {
    // Copy to clipboard functionality for email
    const copyEmailLink = document.getElementById('copyEmail');
    if (copyEmailLink) {
        copyEmailLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            const email = 'garjonar@gmail.com';
            const link = e.target;
            
            navigator.clipboard.writeText(email).then(() => {
                // Change text and highlight
                link.textContent = 'copied!';
                link.classList.add('copied');
                
                setTimeout(() => {
                    link.textContent = email;
                    link.classList.remove('copied');
                }, 2000);
            });
        });
    }

    // Language Toggle functionality
    const langToggle = document.getElementById('langToggle');
    let currentLang = 'ES';

    const translations = {
        'ES': {
            'bio-1': 'Ingeniero enfocado en una aplicación cívica y social de la tecnología asi como en el compromiso medioambiental. Trabajando en la intersección entre la tecnología, la naturaleza y la gente.',
            'bio-2': 'Creo firmemente en usar la ciencia para generar un impacto positivo en nuestro entorno. Busco constantemente formas de materializar ideas y transformar datos complejos en herramientas que aporten valor y acerquen la concienciación a la gente.',
            'bio-3': 'Cuando no estoy investigando sobre alguna frikada tecnologica, probablemente me encuentres explorando la naturaleza en alguna de sus formas.',
            'bio-4': 'En este espacio quiero dar cabida a pequeños proyectos o ideas a las que dedico mi tiempo y cariño.',
            'projects-title': 'Proyectos',
            'project-1-desc': 'GIS & Big Data — Mapa censal del arbolado de Sevilla',
            'project-2-desc': 'Data & Visualization — Análisis de comportamiento del cernícalo vulgar',
            'project-3-desc': 'GIS & Map Animation — Análisis espacial de la ciudad',
            'about-link': 'Sobre este portfolio',
            'back-link': 'Volver al inicio'
        },
        'EN': {
            'bio-1': 'Engineer focused on the civic and social application of technology, as well as environmental commitment. Working at the intersection of technology, nature, and people.',
            'bio-2': 'I firmly believe in using science to generate a positive impact on our environment. I constantly seek ways to materialize ideas and transform complex data into tools that provide value and bring awareness to people.',
            'bio-3': "When I'm not researching some tech geekery, you'll probably find me exploring nature in some form or another.",
            'bio-4': 'In this space, I want to make room for small projects or ideas to which I dedicate my time and care.',
            'projects-title': 'Projects',
            'project-1-desc': "GIS & Big Data — Census map of Seville's trees",
            'project-2-desc': 'Data & Visualization — Behavioral analysis of the common kestrel',
            'project-3-desc': 'GIS & Map Animation — Spatial analysis of the city',
            'about-link': 'About this portfolio',
            'back-link': 'Back to home'
        }
    };

    // Helper for HTML translations
    const htmlTranslations = {
        'ES': {
            'about-text-1': 'Este portfolio basa su identidad estetica completamente en el trabajo de Miggy Fajardo, esto se hace como total gesto de respeto al autor original de la idea y como crítica e invitación a la reflexión sobre la identidad de marca, la originalidad y el concepto de plagio y copia en las redes.'
        },
        'EN': {
            'about-text-1': 'This portfolio bases its aesthetic identity entirely on the work of Miggy Fajardo, this is done as a total gesture of respect to the original author of the idea and as a critique and invitation to reflect on brand identity, originality, and the concept of plagiarism and copying on the web.'
        }
    }

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'ES' ? 'EN' : 'ES';
            
            // Actualizamos todos los toggles si hay más de uno (ej. en múltiples páginas)
            document.querySelectorAll('#langToggle').forEach(btn => {
                btn.textContent = currentLang === 'ES' ? 'EN' : 'ES';
            });

            // TextContent elements
            const elementsToTranslate = ['bio-1', 'bio-2', 'bio-3', 'bio-4', 'projects-title', 'project-1-desc', 'project-2-desc', 'project-3-desc', 'about-link', 'back-link'];

            elementsToTranslate.forEach(id => {
                const element = document.getElementById(id);
                if (element && translations[currentLang][id]) {
                    element.style.opacity = 0;
                    setTimeout(() => {
                        element.textContent = translations[currentLang][id];
                        element.style.opacity = 1;
                    }, 200); 
                }
            });

            // InnerHTML elements
            const htmlElementsToTranslate = ['about-text-1'];
            htmlElementsToTranslate.forEach(id => {
                const element = document.getElementById(id);
                if (element && htmlTranslations[currentLang][id]) {
                    element.style.opacity = 0;
                    setTimeout(() => {
                        element.innerHTML = htmlTranslations[currentLang][id];
                        element.style.opacity = 1;
                    }, 200); 
                }
            });
        });
    }
});
