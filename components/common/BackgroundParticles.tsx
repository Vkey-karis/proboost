
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { type Container, type Engine } from '@tsparticles/engine';
import { useAppContext } from '../../contexts/AppContext';

export const BackgroundParticles: React.FC = () => {
    const [init, setInit] = useState(false);
    const { theme } = useAppContext();

    useEffect(() => {
        initParticlesEngine(async (engine: Engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = useCallback(async (container?: Container) => {
        // console.log(container);
    }, []);

    const options = useMemo(
        () => ({
            background: {
                color: {
                    value: "transparent",
                },
            },
            fpsLimit: 120,
            interactivity: {
                events: {
                    onClick: {
                        enable: true,
                        mode: "push",
                    },
                    onHover: {
                        enable: true,
                        mode: "grab",
                        parallax: {
                            enable: true,
                            force: 60,
                            smooth: 10
                        }
                    },
                    resize: {
                        enable: true
                    },
                },
                modes: {
                    push: {
                        quantity: 4,
                    },
                    grab: {
                        distance: 140,
                        links: {
                            opacity: 0.5
                        }
                    },
                },
            },
            particles: {
                color: {
                    value: theme === 'dark' ? "#ffffff" : "#3b82f6", // White in dark, Primary Blue in light
                },
                links: {
                    color: theme === 'dark' ? "#ffffff" : "#3b82f6",
                    distance: 150,
                    enable: true,
                    opacity: theme === 'dark' ? 0.2 : 0.3,
                    width: 1,
                },
                move: {
                    direction: "none" as const,
                    enable: true,
                    outModes: {
                        default: "bounce" as const,
                    },
                    random: false,
                    speed: 1,
                    straight: false,
                },
                number: {
                    density: {
                        enable: true,
                        area: 800,
                    },
                    value: 80,
                },
                opacity: {
                    value: theme === 'dark' ? 0.3 : 0.5,
                },
                shape: {
                    type: "circle",
                },
                size: {
                    value: { min: 1, max: 3 },
                },
            },
            detectRetina: true,
        }),
        [theme],
    );

    if (init) {
        return (
            <Particles
                id="tsparticles"
                particlesLoaded={particlesLoaded}
                options={options}
                className="absolute inset-0 -z-10 animate-fade-in"
            />
        );
    }

    return null;
};
