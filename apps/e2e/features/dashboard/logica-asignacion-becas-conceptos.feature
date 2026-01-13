Feature: Como colegio poder asignar becas x tipo de concepto y tener la posibilidad de acotar la selección en forma individual

Scenario Outline: Colegio asigna beca por <tipo-de-concepto> sin filtrar conceptos exitosamente y la misma queda elegible para un estudiante
Given existe colegio con concepto del <tipo-de-concepto> creado
And el usuario de dashboard tiene permisos para asignar becas
When el usuario asigna la beca al <tipo-de-concepto>
And uno de los conceptos afectados es asignado a un estudiante
Then se puede asignar la beca al estudiante

Examples:
| tipo-de-concepto |
| Colegiatura      |
| Otro             |

Scenario Outline: Colegio asigna beca por <tipo-de-concepto> filtrando conceptos exitosamente
Given existe colegio con concepto del <tipo-de-concepto> creado
And el usuario de dashboard tiene permisos para asignar becas
When el usuario asigna la beca al <tipo-de-concepto>
And filtra un concepto para que no aplica la beca
And se asigna el concepto NO aplicado a la beca a un estudiante
Then la beca no es elegible para el estudiante

Examples:
| tipo-de-concepto |
| Colegiatura      |
| Otro             |

Scenario Outline: Colegio asigna beca por <tipo-de-concepto> y obtiene mensaje de error
Given existe colegio con concepto del <tipo-de-concepto> creado
And el usuario de dashboard tiene permisos para asignar becas
When el usuario asigna la beca al <tipo-de-concepto>
Then se obtiene mensaje de error

Examples:
| tipo-de-concepto |
| Colegiatura      |
| Otro             |

Scenario: Colegio asigna beca seleccionando individualmente el concepto
Given existe colegio con concepto del <tipo-de-concepto> creado
And el usuario de dashboard tiene permisos para asignar becas
When el usuario asigna la beca seleccionando individualmente 1 concepto
And el concepto afectado es asignado a un estudiante
Then se puede asignar la beca al estudiante

Scenario Outline: Beca asignada a <tipo-de-concepto> se aplica a concepto nuevo del tipo al que aplica la beca
Given existe una beca asignada al <tipo-de-concepto>
And el usuario de dashboard tiene permisos para asignar becas
When el usuario crea un concepto del <tipo-de-concepto>
And el concepto afectado es asignado a un estudiante
Then se puede asignar la beca al estudiante

Examples:
| tipo-de-concepto |
| Colegiatura      |
| Otro             |