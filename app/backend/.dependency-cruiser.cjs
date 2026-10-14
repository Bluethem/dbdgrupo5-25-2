/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'dominio-monitoreo-no-depende-de-infra',
      comment:
        'El dominio de monitoreo no debe depender de infraestructura, Nest ni TypeORM (rodaja Lab06).',
      severity: 'error',
      from: {
        path: '^src/monitoreo/dominio',
        pathNot: '\\.spec\\.ts$',
      },
      to: {
        path: '^src/monitoreo/(infraestructura|controllers|services)',
      },
    },
    {
      name: 'dominio-monitoreo-no-depende-de-framework',
      comment: 'El dominio no importa NestJS ni TypeORM.',
      severity: 'error',
      from: {
        path: '^src/monitoreo/dominio',
        pathNot: '\\.spec\\.ts$',
      },
      to: {
        path: 'node_modules/(@nestjs|typeorm)',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      mainFields: ['main', 'types', 'typings'],
    },
  },
};
