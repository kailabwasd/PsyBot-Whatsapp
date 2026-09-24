import React from 'react';

interface BogotaCrestProps {
  className?: string;
  size?: number;
}

/**
 * Escudo Oficial de Bogotá D.C.
 * Águila imperial coronada de sable/oro en campo de oro, sosteniendo dos granadas de oro en sus garras,
 * rodeada de bordura de gules con nueve granadas de oro, símbolo oficial de la Alcaldía Mayor de Bogotá D.C.
 */
export const BogotaCrest: React.FC<BogotaCrestProps> = ({ className = '', size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Escudo de Bogotá Distrito Capital"
    >
      {/* Outer shield border / Bordura de Gules (Rojo Bogotá) */}
      <path
        d="M50 4 C24 4 10 18 10 36 C10 74 34 100 50 110 C66 100 90 74 90 36 C90 18 76 4 50 4 Z"
        fill="#C8102E"
        stroke="#8B0000"
        strokeWidth="2"
      />
      {/* Inner field / Campo de Oro (Amarillo Bogotá) */}
      <path
        d="M50 12 C30 12 18 24 18 38 C18 70 38 92 50 100 C62 92 82 70 82 38 C82 24 70 12 50 12 Z"
        fill="#FFC800"
        stroke="#D4A000"
        strokeWidth="1.5"
      />
      
      {/* Nine golden pomegranates on the border */}
      <circle cx="50" cy="8" r="2.5" fill="#FFC800" stroke="#8B0000" strokeWidth="0.5" />
      <circle cx="30" cy="11" r="2.5" fill="#FFC800" stroke="#8B0000" strokeWidth="0.5" />
      <circle cx="70" cy="11" r="2.5" fill="#FFC800" stroke="#8B0000" strokeWidth="0.5" />
      <circle cx="15" cy="30" r="2.5" fill="#FFC800" stroke="#8B0000" strokeWidth="0.5" />
      <circle cx="85" cy="30" r="2.5" fill="#FFC800" stroke="#8B0000" strokeWidth="0.5" />
      <circle cx="15" cy="55" r="2.5" fill="#FFC800" stroke="#8B0000" strokeWidth="0.5" />
      <circle cx="85" cy="55" r="2.5" fill="#FFC800" stroke="#8B0000" strokeWidth="0.5" />
      <circle cx="28" cy="82" r="2.5" fill="#FFC800" stroke="#8B0000" strokeWidth="0.5" />
      <circle cx="72" cy="82" r="2.5" fill="#FFC800" stroke="#8B0000" strokeWidth="0.5" />

      {/* Águila Imperial de Bogotá (Cuerpo y Alas) */}
      <g fill="#0B2545">
        {/* Corona Imperial */}
        <path d="M42 22 L45 28 L50 24 L55 28 L58 22 L55 31 L45 31 Z" fill="#8B0000" />
        <circle cx="50" cy="22" r="1.5" fill="#8B0000" />
        <path d="M44 30 H56 V32 H44 Z" fill="#8B0000" />

        {/* Cabeza del Águila mirando a la diestra */}
        <path d="M46 31 C46 28 50 28 52 30 C54 32 54 34 52 36 L48 36 C46 35 46 33 46 31 Z" />
        {/* Pico */}
        <path d="M46 32 L41 33.5 L46 35 Z" fill="#C8102E" />

        {/* Cuello y Pecho */}
        <path d="M47 36 C44 40 44 45 46 52 C48 57 52 57 54 52 C56 45 56 40 53 36 Z" />

        {/* Ala Derecha */}
        <path d="M44 38 C36 34 26 38 23 46 C21 51 24 54 28 54 C33 54 39 48 44 46 Z" />
        <path d="M23 46 C20 52 23 58 28 60 C32 60 38 54 42 50 Z" />
        <path d="M28 60 C26 64 30 67 35 66 C39 64 42 58 44 54 Z" />

        {/* Ala Izquierda */}
        <path d="M56 38 C64 34 74 38 77 46 C79 51 76 54 72 54 C67 54 61 48 56 46 Z" />
        <path d="M77 46 C80 52 77 58 72 60 C68 60 62 54 58 50 Z" />
        <path d="M72 60 C74 64 70 67 65 66 C61 64 58 58 56 54 Z" />

        {/* Cola estilizada */}
        <path d="M47 56 L45 74 L50 78 L55 74 L53 56 Z" />

        {/* Garras sosteniendo las granadas */}
        {/* Garra diestra */}
        <path d="M43 62 L39 67 L42 69 L45 64 Z" fill="#C8102E" />
        {/* Granada derecha */}
        <circle cx="36" cy="71" r="5" fill="#C8102E" stroke="#FFC800" strokeWidth="1" />
        <path d="M34 66 L36 64 L38 66 Z" fill="#0B2545" />

        {/* Garra siniestra */}
        <path d="M57 62 L61 67 L58 69 L55 64 Z" fill="#C8102E" />
        {/* Granada izquierda */}
        <circle cx="64" cy="71" r="5" fill="#C8102E" stroke="#FFC800" strokeWidth="1" />
        <path d="M62 66 L64 64 L66 66 Z" fill="#0B2545" />
      </g>
    </svg>
  );
};
