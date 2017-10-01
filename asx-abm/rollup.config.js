export default {
    entry: 'src/AS.js',
    banner: '/* eslint-disable */',
    targets: [
        {
            dest: 'dist/AS.js',
            format: 'iife',
            moduleName: 'AS'
    },
        {
            dest: 'dist/AS.module.js',
            format: 'es'
    },
        {
            dest: 'dist/AS.cjs.js',
            format: 'cjs',
            moduleName: 'AS'
    }
  ]
}