Feature: Como colegio queremos poder desasignar conceptos masivamentea nuestros estudiantes.

Scenario Outlines: Colegio desasigna todos los estudiantes asignados a un concepto tipo <concept-type> con exito
Given existe el concepto de tipo <concept-type>
And tiene estudiantes asociados
And ningun estudiante tiene pagos en estado payd, partial_pay o waiting_pay
And el usuario del colegio puede desasginar conceptos
And el usuario esta en la solapa estudiantes asignados del concepto
When clickea en el checkbox para todos los alumnos
And visualiza footer con cantidad de alumnos a desasginar y boton de accion
And presiona el boton Desasignar
And visualiza modal de confirmación
And presiona el boton Si, desasginar 
Then refresca el concepto y la sola estudiantes asignados esta vacia
And recibe un mensaje de exito al finalizar el proceso

Examples:
| concept-type  |
|  monthly-fee  |
|  optional     |

Scenario: Colegio desasigna todos los estudiantes asignados a un concepto dejando asociadas las ordenes vencidas 
Given existe el concepto
And tiene estudiantes asociados
And ningun estudiante tiene pagos en estado paid, partial_pay o waiting_pay
And tienen ordenes vencidas
And el usuario del colegio puede desasginar conceptos
And el usuario esta en la solapa estudiantes asignados del concepto
When clickea en el checkbox para todos los alumnos
And visualiza footer con cantidad de alumnos a desasginar y boton de accion
And presiona el boton Desasignar
And visualiza modal de confirmación
And marca la opcion Mantener ordenes vencidas luego de desasginar
And presiona el boton Si, desasginar 
Then el estudiante tiene vigente el concepto
And solo tiene las ordenes vencidas asociadas
And recibe un mensaje de exito al finalizar el proceso

Scenario Outlines: Colegio no puede desasignar concepto de pago obligatorio por el estado de pago de sus ordenes
Given existe el concepto
And tiene estudiantes asociados
And los estudiantes tienes pagos en estado <pay-status>
And el usuario del colegio puede desasginar conceptos
And el usuario esta en la solapa estudiantes asignados del concepto
When clickea en el checkbox para todos los alumnos
And visualiza footer con cantidad de alumnos a desasginar y boton de accion
And presiona el boton Desasignar
And visualiza modal de confirmación
And en el modal ve el mensaje "Se mantendrán las órdenes pagadas parcialmente o en proceso."
And presiona el boton Si, desasginar 
Then el estudiante sigue asignado en la solapa estudiantes asignados
And solo tiene asociada la orden con estado <pay-status>

Examples:
| pay-status   |
| partial_pay  |
| waiting_pay  |


Scenario Outlines: Colegio desasigna concepto de pago optional con ordenes pagas
Given existe el concepto opcional
And tiene estudiantes asociados
And los estudiantes tienen ordenes pagas del concepto
And el usuario del colegio puede desasginar conceptos
And el usuario esta en la solapa estudiantes asignados del concepto
When clickea en el checkbox para todos los alumnos
And visualiza footer con cantidad de alumnos a desasginar y boton de accion
And presiona el boton Desasignar
And visualiza modal de confirmación
And en el modal ve el mensaje "Al desasignar a los estudiantes, estos ya no podrán visualizar este concepto en el portal de pagos de Cometa."
And en el modal ve el mensaje "La información de todos los pagos realizados permanecerá accesible para el colegio a través del dashboard."
And presiona el boton Si, desasginar 
Then el estudiante ya no se visualiza en la sola estudiantes asignados
And en el detalle de pagos se sigue visualizando el pago realizado para este concepto

Examples:
| pay-status   |
| partial_pay  |
| waiting_pay  |

Scenario: Colegio desasigna conceptos de algunos de los estudiantes asignados
Given existe el concepto de tipo <concept-type>
And tiene estudiantes asociados
And ningun estudiante tiene pagos en estado payd, partial_pay o waiting_pay
And el usuario del colegio puede desasginar conceptos
And el usuario esta en la solapa estudiantes asignados del concepto
When activa el checkbos de los estudiantes a desasignar
And visualiza footer con cantidad de alumnos a desasginar y boton de accion
And presiona el boton Desasignar
And visualiza modal de confirmación
And presiona el boton Si, desasginar 
Then refresca el concepto y la solapa estudiantes asignados ya no tiene los estudiantes elegidos
And recibe un mensaje de exito al finalizar el proceso

Examples:
| concept-type  |
|  monthly-fee  |
|  optional     |