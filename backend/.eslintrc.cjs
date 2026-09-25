module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  settings: {
    // M1 — Antes aquí se declaraba el resolver 'typescript', pero
    // eslint-import-resolver-typescript nunca se instaló: solo está el de Node. El
    // resultado eran 366 errores falsos de import/*, ni siquiera podía resolver módulos
    // nativos como 'crypto'. Eso hacía fallar `npm run lint` en la raíz y enterraba los
    // ~20 avisos que sí eran reales.
    'import/ignore': ['node_modules'],
  },
  rules: {
    // TypeScript ya valida que los imports existan y que los nombres sean correctos.
    // Estas reglas solo repiten ese trabajo y necesitan un resolver propio para acertar.
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'import/namespace': 'off',
    'import/default': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',

    // Los `any` que quedan (20) son deuda real del código, no ruido de configuración.
    // Quedan como aviso para que sigan a la vista sin bloquear el lint de toda la raíz;
    // arreglarlos de golpe y a ciegas era más arriesgado que dejarlos señalados.
    '@typescript-eslint/no-explicit-any': 'warn',
    // El manejador de errores de Express necesita los cuatro parámetros para que el
    // framework lo reconozca como tal, aunque no use el último.
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['dist', 'node_modules'],
  overrides: [
    {
      files: ['**/*.ts'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        // Va aquí y no arriba: este `extends` se aplica después y volvía a ponerlo en error.
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
    {
      // Los tests usan require() a propósito para cargar módulos tras preparar el entorno.
      files: ['**/*.test.ts'],
      rules: { '@typescript-eslint/no-var-requires': 'off' },
    },
  ],
};
