Feature: Como colegio queremos poder agregar y eliminar recargos visibles u ocultos al tutor.

Scenario Outlines: Colegio agrega recargo a orden de pago mensual.
Given Existe un estudiante creado
And tiene un concepto asociado
And una orden por pagar
When se agrega un recargo a dicha orden
Then se suma el recargo al total de la orden
And se agrega una linea de texto con la descripción y monto del recargo

Examples:
| Tipo de conceptos |
| Monthly           |
| Other             |

Scenario: Colegio elimina recargo a orden de pago mensual sin pago parcial registrado
Given Existe un estudiante creado
And tiene un concepto asociado
And una orden por pagar
And recargo agregado a dicha orden
When elimina el recargo de la orden
Then se elimina linea de texto con la descripción y monto del recargo
And se resta del total a pagar el recargo

Scenario: Colegio no puede eliminar recargo a orden de pago mensual con pago parcial registrado
Given Existe un estudiante creado
And tiene un concepto asociado
And una orden por pagar
And recargo agregado a dicha orden
And tiene un pago parcial
And el total adeudado es menor al recargo
When ingresa al detalle de la orden
Then ve deshabilitado el tacho de basura para eliminar el concepto
And se muestra una leyenda explicando el motivo

Scenario: Colegio puede eliminar recargo a orden de pago mensual con pago parcial registrado
Given Existe un estudiante creado
And tiene un concepto asociado
And una orden por pagar
And recargo agregado a dicha orden
And tiene un pago parcial
And el total adeudado es mayor al recargo
When ingresa al detalle de la orden
Then ve deshabilitado el tacho de basura para eliminar el concepto
And se muestra una leyenda explicando el motivo