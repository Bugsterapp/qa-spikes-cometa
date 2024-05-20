export const splitSection = (section: string): [string, string] => {
  if (!section.includes('|')) {
    return [section, ''];
  }
  const parts = section.split('|');
  return [parts[0], parts[1]];
};
