const cubemapSchemaConfig = {
  class: 'VrmModel',
  description: 'Cubemap image with 6 faces for Humanoid 3D model',
  vectorizer: 'multi2vec-clip',
  moduleConfig: {
    'multi2vec-clip': {
      textFields: ['title'],
      imageFields: ['image'],
    },
  },
  properties: [
    {
      dataType: ['blob'],
      description: 'Cubemap image (view)',
      name: 'image',
    },
    {
      dataType: ['string'],
      description: 'model name (description) of the given image.',
      name: 'title',
    },
    {
      dataType: ['string'],
      description: 'Model view(front, back, left, right, top, bottom)',
      name: 'view',
    },
  ],
};

export { cubemapSchemaConfig };
