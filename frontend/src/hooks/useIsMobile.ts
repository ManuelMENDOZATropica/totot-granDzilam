// src/hooks/useIsMobile.ts
import { useState, useEffect } from 'react';

// El breakpoint 'sm' de Tailwind es 640px
const MOBILE_BREAKPOINT = 640;

export const useIsMobile = () => {
  // Inicializamos el estado asumiendo que es móvil si estamos en el servidor, 
  // o basándonos en el ancho real si estamos en el cliente.
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : true
  );

  useEffect(() => {
    // Función para actualizar el estado
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Agregar el listener al montar el componente
    window.addEventListener('resize', handleResize);
    
    // Llamar una vez para establecer el valor inicial correctamente después del render
    handleResize(); 

    // Limpiar el listener al desmontar el componente
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};