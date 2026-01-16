Feature: Como colegio queremos visualizar en una tabla el resumen de eficiencia y alumnos sin pagar para un mes del ciclo 

Scenario: Se muestra empty state en la tabla de eficiencia si no se puede seleccionar los ciclos
Given existe una escuela XXX
And existen 20 alumnos activos en el <ciclo>
When falla la api que devuelve los ciclos
Then no se carga ni el grafico ni la tabla de eficiencia 

Scenario Outlines: Colegio ve Empty state en tabla de cobranzas al ingresar y no tener alumnos con conceptos asignados para ese mes
Given existe una escuela XXX
Given existen <cantidad-de-alumnos> alumnos activos en el <ciclo>
And existe un concepto <Concepto> para todos los meses del ciclo
And <cantidad-de-alumnos> alumnos tienen asignados todos meses del 
And <cantidad-alumonos-pagos> tiene pago la orden del mes
When el colegio esta en la seccion cobranzas
Then la tabla esta tiene el filtro MES en el mes que corresponde a la fecha de hoy
And se listan los 10 alumnos en la tabla
And el porcentage de cumplimiento es del <porcentage-eficiencia>

Examples:
| cantidad-de-alumnos | Ciclo   | cantidad-alumonos-pagos | Concepto     | porcentage-eficiencia |
|   20                | 23/24   |   10                    | Colegiatura  | 50                    |
|   20                | 23/24   |   20                    | Colegiatura  | 100                   |
|   20                | 23/24   |   0                     | Colegiatura  | 0                     |

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