Feature: Como colegio queremos visualizar en un grafico las cobranzas que nos de un pantallazo de las cobranzas y se explote el detalle en un tabla
el mismo se tiene que poder filtrar por ciclo, tipo de concepto y concepto.

Scenario: Empty state grafico de cobranzas si lanza error la api
Given existe una escuela XXX
And existe el <ciclo> para esa escuela 
And tengo alumnos con conceptos con fecha de vencimiento para el ciclo
When el colegio ingresa en seccion cobranzas
Then se muestra empty state en grafico cobranzas

Scenario: Empty state grafico de cobranzas para un concepto sin alumnos asignados
Given existe una escuela XXX
And existe el <ciclo> para esa escuela 
And no tengo alumnos con conceptos con fecha de vencimiento para el ciclo
When el colegio ingresa en seccion cobranzas
Then se muestra empty state en grafico cobranzas

Scenario Outlines: Se redondea el numero maximo eje Y al centecimo superior mas cercano para el mes con mas cantidad de alumnos
Given existe una escuela XXX
And existen 10 alumnos activos en el <ciclo>
And existe un concepto colegiatura obligatorio para todos los meses del ciclo
And los 10 alumnos tiene asignados todos meses del concepto
When el colegio esta en la seccion cobranzas
When filtra por el <ciclo> y concepto
Then el eje Y es <cantidad-alumonos-eje-Y>   

Examples:
| cantidad-de-alumnos | Ciclo   | cantidad-alumonos-eje-Y | Concepto     |
|   10                | 23/24   |   100                   | Colegiatura  |
|   930               | 23/24   |   1000                  | Colegiatura  |
|   1050              | 23/24   |   1100                  | Colegiatura  |
|   140               | 22/23   |   200                   | Colegiatura  |
|   960               | 22/23   |   100                   | Colegiatura  |
|   1080              | 22/23   |   1100                  | Colegiatura  |
|   10                | 23/24   |   100                   | Opcional     |
|   930               | 23/24   |   1000                  | Opcional     |
|   1050              | 23/24   |   1100                  | Opcional     |
|   140               | 22/23   |   200                   | Opcional     |
|   960               | 22/23   |   100                   | Opcional     |
|   1080              | 22/23   |   1100                  | Opcional     |

Scenario Outlines: Se redondea el numero maximo eje Y al centecimo superior mas cercano para el mes con mas cantidad de alumnos y el resto sin datos por pagar
Given existe una escuela XXX
And existe el <ciclo> para esa escuela 
And existen 10 alumnos activos en el <ciclo>
And existe el concepto <Concepto> creado para el <ciclo>
And los 10 alumnos tienen asignado la orden del concepto del <ordenes-asignadas-al-alumno>
When el colegio esta en la seccion cobranzas
When filtra por el <ciclo> y concepto
Then el eje Y es <cantidad-alumonos-eje-Y> para el mes <mes-ordenes-asignadas-al-alumno>
And solo se dibuja en el eje X la la barra para el mes <mes-ordenes-asignadas-al-alumno> que tiene ordenes con fecha de venicimiento para se mes

Examples:
| cantidad-de-alumnos | Ciclo   | cantidad-alumonos-eje-Y | Concepto    | mes-ordenes-asignadas-al-alumno |
|   10                | 23/24   |   100                   | Colegiatura | Septiembre                  | 
|   10                | 23/24   |   100                   | Colegiatura | Octubre                     |
|   10                | 23/24   |   100                   | Colegiatura | Noviembre                   | 
|   10                | 23/24   |   100                   | Colegiatura | Diciembre                   |
|   10                | 23/24   |   100                   | Colegiatura | Enero                       |
|   10                | 23/24   |   100                   | Colegiatura | Febrero                     |
|   10                | 23/24   |   100                   | Colegiatura | Febrero                     |
|   10                | 23/24   |   100                   | Colegiatura | Abril                       |
|   10                | 23/24   |   100                   | Colegiatura | Mayo                        |
|   10                | 23/24   |   100                   | Colegiatura | Junio                       |

Scenario: Se divide en 5 bloques el grafico de cobranzas
Given existe una escuela XXX
And existe el <ciclo> para esa escuela 
And tengo 100 alumnos con conceptos con fecha de vencimiento para el ciclo y mes febrero
When el colegio ingresa en seccion cobranzas
Then visualiza en el grafico de cobranzas se muestran lineas punteadas generando 5 bloques desde 0 al monto maximo del eje Y

Scenario Outlines: Escuela aplica un filtro de concepto y se actualiza la tabla 
Given existe una escuela XXX
And  existen <cantidad-de-alumnos> alumnos activos en el <ciclo>
And existe un concepto <filtro-concepto> para todos los meses del ciclo
And <cantidad-de-alumnos> alumnos tienen asignados todos meses del 
And <cantidad-alumonos-pagos> tiene pago la orden del mes
When el colegio esta en la seccion cobranzas
And la tabla esta tiene el filtro MES en el mes que corresponde a la fecha de hoy
Then selecciono el mes de marzo 

Examples:
| cantidad-de-alumnos | Ciclo   | cantidad-alumonos-pagos | porcentage-eficiencia |  filtro-concepto | mes-filtro |
|   30                | 23/24   |   10                    | 33.33                 |  materiales      | marzo      | 
|   20                | 23/24   |   17                    | 85                    |  materiales      | abril      | 
|   10                | 23/24   |   9                     | 90                    |  materiales      | mayo       |