// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      keyframes: {
        slideDown: {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        slideUp: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        slideDown: 'slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        slideUp: 'slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
    plugin(function (helpers) {
      // variants that help styling Radix-UI components
      dataStateVariant('active', helpers);
      dataStateVariant('closed', helpers);
      dataStateVariant('placeholder', helpers);
      // dataStateVariant('on', helpers);
      // dataStateVariant('checked', helpers);
      // dataStateVariant('unchecked', helpers);
    }),
  ],
};

function dataStateVariant(
  state,
  {
    addVariant, // for registering custom variants
    e, // for manually escaping strings meant to be used in class names
  }
) {
  addVariant(`data-state-${state}`, ({ modifySelectors, separator }) => {
    modifySelectors(({ className }) => `.${e(`data-state-${state}${separator}${className}`)}[data-state='${state}']`);
  });

  addVariant(`group-data-state-${state}`, ({ modifySelectors, separator }) => {
    modifySelectors(
      ({ className }) => `.group[data-state='${state}'] .${e(`group-data-state-${state}${separator}${className}`)}`
    );
  });

  addVariant(`peer-data-state-${state}`, ({ modifySelectors, separator }) => {
    modifySelectors(
      ({ className }) => `.peer[data-state='${state}'] ~ .${e(`peer-data-state-${state}${separator}${className}`)}`
    );
  });
}
