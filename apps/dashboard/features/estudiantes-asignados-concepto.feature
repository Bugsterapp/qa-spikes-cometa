Feature: Como colegio queremos contar con un reporte que nos indique que alumnos estan asignados a un concepto

Scenario Outline: Se ven alumnos en seccion estudiantes asignados de concepto tipo obligatorio sin ordenes agregadas a ellos. 
Given existe concepto de tipo obligatorio
And existe un alumno creado para el colegio
And tiene asignado el concepto <nombre-concepto>
When colegio ingresa en seccion conceptos
And elige el concepto <nombre-concepto>
And ingresa en el tab Estudiantes asignados
And se visualiza la tabla de alumnos con las columnas [estudiante, Nivel y Grupo, Ordenes pagadas, Total Pagado, Por pagar]
And la columna Estudiante tiene nombre completo y matricula del estudiante
And la columna nivel y grupo tiene el nivel, seccion y grupo contiene los datos del estudiante
And ordenes pagadas es 0 de 0
And total pagado es 0.00
And total por pagar es 0.00

Examples:
| tipo-concepto              | nombre-concepto |
| colegiatura                | colegiatura     | 

Scenario Outline: Se ven alumnos en seccion estudiantes asignados de concepto tipo obligatorio con ordenes mensuales agregadas a ellos. 
Given existe concepto de tipo colegiatura con 12 meses por pagar
And existe un alumno creado para el colegio
And tiene asignado el concepto colegiatura con sus 12 meses
And tiene pagos los <meses-pagos> meses del ciclo
When colegio ingresa en seccion conceptos
And elige el concepto colegiatura
And ingresa en el tab Estudiantes asignados
Then se visualiza el alumno en la tabla
And la columna Ordenes pagas es <columna-ordenes-pagas>
And la columna total pago es <total-pago>
And la columna por pagar es <por-pagar>

Examples:
| columna-ordenes-pagas | meses-pagos | por-pagar    | total-pago   |
| 12 de 12              |   12        | '0.00'       |  '41,746.83' |
| 2 de 12               |   2         | '32,223.00'  |  '6,000.00'  |
| 0 de 12               |   0         | '39,746.83'  |  '0.00'      |

Scenario Outline: Colegio puede ver la leyenda pagos en proceso en la seccion estudiantes asignados de un concepto 
Given existe concepto de tipo colegiatura con 12 meses por pagar
And existe un alumno creado para el colegio
And tiene asignado el concepto colegiatura con sus 12 meses
And tiene 1 pago por <metodo-pago>
When colegio ingresa en seccion conceptos
And elige el concepto colegiatura
And ingresa en el tab Estudiantes asignados
Then se visualiza el alumno en la tabla
And la columna Ordenes pagas es 0 de 12
And bajo aparece la leyenda 1 pago en proceso

Examples:
| metodo-pago   | tipo-concepto              |
| bank-transfer | opcional con atributos     |
| efectivo      | opcional con atributos     |
| bank-transfer | opcional sin atributos     |
| efectivo      | opcional sin atributos     |
| bank-transfer | obligatorio                |
| efectivo      | obligatorio                |

Scenario: Se ve un alumno con concepto del tipo opcional en la seccion estudiantes asociados con pago realizado
Given existe concepto opcional del tipo Uniformes y Merchandise con atributos con valor 2,000.00
And existe un alumno creado para el colegio
And tiene asignado el concepto colegiatura con 2 atributos asociados
And tiene pago una orden del concepto por 2,000.00
When colegio ingresa en seccion conceptos
And elige el concepto colegiatura
And ingresa en el tab Estudiantes asignados
Then se visualiza la tabla de alumnos con las columnas [estudiante, Nivel y Grupo, Ôrdenes pagadas, Total Pagado]
And la columna Ôrdenes pagadas muestra 1 orden paga
And la columna Total pagado es 2,000.00

Scenario: Se ve un alumno con concepto del tipo Opcional en la seccion estudiantes asociados sin pagos realizados
Given existe concepto opcional del tipo Uniformes y Merchandise con atributos con valor 2,000.00
And existe un alumno creado para el colegio
And tiene asignado el concepto colegiatura con 2 atributos asociados
And no tiene ninguna orden del concepto paga
When colegio ingresa en seccion conceptos
And elige el concepto colegiatura
And ingresa en el tab Estudiantes asignados
Then se visualiza el alumno en la tabla las columnas [estudiante, Nivel y Grupo, Ôrdenes pagadas, Total Pagado]
And la columna Total pagado es 0.00

//REVISANDO EL CASO FRANCO
Scenario: Se ve un alumno con concepto que acepta pago parcial con una orden con pago parcial realizado
Given existe concepto de tipo colegiatura con 12 meses por pagar
And existe un alumno creado para el colegio
And tiene asignado el concepto colegiatura con sus 12 meses
And tiene 1 pago parcial por 2000
When colegio ingresa en seccion conceptos
And elige el concepto colegiatura
And ingresa en el tab Estudiantes asignados
Then se visualiza el alumno en la tabla
And la columna Ordenes pagas es 0 de 12
And la columna total pago es 2,000.00
And la columna por pagar es 39,746.83

Scenario: Filtrar alumnos por nombre completo
Given existe concepto de tipo obligatorio
And existe un alumno creado para el colegio
And tiene asignado el concepto obligatorio
When colegio ingresa en seccion conceptos
And elige el concepto Colegiatura
And ingresa en el tab Estudiantes asignados
And Ingresa el nombre del estudiante en campo buscar estudiante
Then se ve en la tabla solo el estudiante buscado

Scenario: Filtrar alumnos por nombre con string parcial
Given existe concepto de tipo obligatorio
And existe un alumno creado para el colegio
And tiene asignado el concepto obligatorio
When colegio ingresa en seccion conceptos
And elige el concepto Colegiatura
And ingresa en el tab Estudiantes asignados
And Ingresa un nombre parcial JAY en el campo buscar estudiantes
Then se ve en la tablas solo los estudiantes que cumplen con el filtro

Scenario Outlines: Filtrar alumnos por nivel
Given existe concepto de tipo obligatorio
And existe un alumno creado para el colegio
And tiene asignado el concepto obligatorio
When colegio ingresa en seccion conceptos
And elige el concepto Colegiatura
And ingresa en el tab Estudiantes asignados
And selecciona del filtro nivel la opcion <opcion-filtro> 
Then se ve en la tabla solo los estudiantes que cumplen con el filtro

Examples:
|opcion-filtro|
| primaria    |
| secundaria  |

Scenario Outlines: Filtrar alumnos por seccion
Given existe concepto de tipo obligatorio
And existe un alumno creado para el colegio
And tiene asignado el concepto obligatorio
When colegio ingresa en seccion conceptos
And elige el concepto Colegiatura
And ingresa en el tab Estudiantes asignados
And selecciona del filtro nivel la opcion <opcion-filtro> 
Then se ve en la tabla solo los estudiantes que cumplen con el filtro

Examples:
|opcion-filtro        |
| 2 A Primaria        |
| 2 A Secundaria      |

Scenario Outlines: Filtrar alumnos por concepto
Given existe concepto de tipo obligatorio
And existe un alumno creado para el colegio
And tiene asignado el concepto obligatorio
When colegio ingresa en seccion conceptos
And elige el concepto Colegiatura
And ingresa en el tab Estudiantes asignados
And selecciona del filtro nivel la opcion <opcion-filtro> 
Then se ve en la tabla solo los estudiantes que cumplen con el filtro

Examples:
|opcion-filtro        |
| Ropa                |
| Colegiatura         |

Scenario Outlines: Filtrar alumnos por beca
Given existe concepto de tipo obligatorio
And existe un alumno creado para el colegio
And tiene asignado el concepto obligatorio
When colegio ingresa en seccion conceptos
And elige el concepto Colegiatura
And ingresa en el tab Estudiantes asignados
And selecciona del filtro nivel la opcion <opcion-filtro> 
Then se ve en la tabla solo los estudiantes que cumplen con el filtro

Examples:
|opcion-filtro        |
| 10%                 |
| 20%                 |

Scenario Outlines: Filtrar alumnos por nivel y concepto
Given existe concepto de tipo obligatorio
And existe un alumno creado para el colegio
And tiene asignado el concepto obligatorio
When colegio ingresa en seccion conceptos
And elige el concepto Colegiatura
And ingresa en el tab Estudiantes asignados
And selecciona del filtro nivel la opcion <opcion-filtro-nivel> 
And selecciona del filtro nivel la opcion <opcion-filtro-concepto> 
Then se ve en la tabla solo los estudiantes que cumplen con el filtro

Examples:
|opcion-filtro-nivel| opcion-filtro-concepto|
| primaria          | ropa                  |
| secundaria        | ropa                  |

Scenario Outlines: Filtrar alumnos aplicando 1 opcion de cada filtro
Given existe concepto de tipo obligatorio
And existe un alumno creado para el colegio
And tiene asignado el concepto obligatorio
When colegio ingresa en seccion conceptos
And elige el concepto Colegiatura
And ingresa en el tab Estudiantes asignados
And seleccionar al menos 1 opcion de cada filtro
Then se ve en la tabla solo los estudiantes que cumplen con el filtro