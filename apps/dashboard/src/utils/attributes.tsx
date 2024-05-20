export const AttributesData: Attribute[] = [
  { id: 1, name: 'Triangle', type: 'shape', school_name: 'Brillamont' },
  { id: 2, name: 'Blue', type: 'color', school_name: 'Oceancrest' },
  { id: 3, name: 'Green', type: 'color', school_name: 'Brillamont' },
  { id: 4, name: 'Small', type: 'size', school_name: 'Oceancrest' },
  { id: 5, name: 'Purple', type: 'color', school_name: 'Oceancrest' },
  { id: 6, name: 'Extra Large', type: 'size', school_name: 'Starview' },
  { id: 7, name: 'Extra Large', type: 'size', school_name: 'Starview' },
  { id: 8, name: 'Cyan', type: 'color', school_name: 'Starview' },
  { id: 9, name: 'Magenta', type: 'color', school_name: 'Sunshine' },
  { id: 10, name: 'Orange', type: 'color', school_name: 'Oceancrest' },
  { id: 11, name: 'Square', type: 'shape', school_name: 'Brillamont' },
  { id: 12, name: 'Small', type: 'size', school_name: 'Brillamont' },
  { id: 13, name: 'Square', type: 'shape', school_name: 'Sunshine' },
  { id: 14, name: 'Large', type: 'size', school_name: 'Mountainpeak' },
  { id: 15, name: 'Square', type: 'shape', school_name: 'Mountainpeak' },
  { id: 16, name: 'Triangle', type: 'shape', school_name: 'Brillamont' },
  { id: 17, name: 'Purple', type: 'color', school_name: 'Mountainpeak' },
  { id: 18, name: 'Large', type: 'size', school_name: 'Starview' },
  { id: 19, name: 'Large', type: 'size', school_name: 'Brillamont' },
  { id: 20, name: 'Square', type: 'shape', school_name: 'Mountainpeak' },
  { id: 21, name: 'Orange', type: 'color', school_name: 'Sunshine' },
  { id: 22, name: 'Yellow', type: 'color', school_name: 'Brillamont' },
  { id: 23, name: 'Cyan', type: 'color', school_name: 'Sunshine' },
  { id: 24, name: 'Magenta', type: 'color', school_name: 'Brillamont' },
  { id: 25, name: 'Small', type: 'size', school_name: 'Brillamont' },
  { id: 26, name: 'Pink', type: 'color', school_name: 'Oceancrest' },
  { id: 27, name: 'Rectangle', type: 'shape', school_name: 'Starview' },
  { id: 28, name: 'Purple', type: 'color', school_name: 'Starview' },
  { id: 29, name: 'Oval', type: 'shape', school_name: 'Oceancrest' },
  { id: 30, name: 'Large', type: 'size', school_name: 'Sunshine' },
];

export type ItemType = {
  id: string;
  name: string;
};

export type DataType = {
  type: string;
  items: ItemType[];
};

export const AttributesByType: DataType[] = [
  {
    type: 'Shape',
    items: [
      { id: '1', name: 'Triangle' },
      { id: '2', name: 'Square' },
      { id: '3', name: 'Rectangle' },
      { id: '4', name: 'Circle' },
      { id: '5', name: 'Oval' },
    ],
  },
  {
    type: 'Color',
    items: [
      { id: '1', name: 'Red' },
      { id: '2', name: 'Blue' },
      { id: '3', name: 'Green' },
      { id: '4', name: 'Yellow' },
      { id: '5', name: 'Purple' },
    ],
  },
  {
    type: 'Size',
    items: [
      { id: '1', name: 'Small' },
      { id: '2', name: 'Medium' },
      { id: '3', name: 'Large' },
      { id: '4', name: 'Extra Large' },
      { id: '5', name: 'Extra Small' },
    ],
  },
];

export interface Attribute {
  id: number;
  name: string;
  type: 'color' | 'shape' | 'size';
  school_name: string;
}
