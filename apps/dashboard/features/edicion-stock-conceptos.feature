Feature: Quiero tener una seccion en el detalle de cada concepto opcional con o sin variantes que me permita controlar el stock.

Scenario Outlines: Cliente agrega inventario para una concepto opcional SIN variantes
Given existe concepto opcional sin variantes con stock 2
And usuario con permisos para editar stock
When usuario ingresa en detalle del concepto
And usuario clickea en <tipo_edición> en edita en 1 el stock
And se actualiza modal indicando nuevo stock
And  usuario confirma la edición
Then se actualiza el detalle del concepto con nuevo el stock.
And al intentar registrar un pago en portal se ve el nuevo stock
And al intentar registrar un pago en dashboard se ve el nuevo stock

Example:
| tipo_edición |
| incrementa   |
| decrementa |


Scenario Outlines: Cliente agrega inventario para una concepto opcional SIN variantes configurado con stock ilimitado
Given existe concepto opcional sin variantes con stock ilimitado
And usuario con permisos para editar stock
When usuario ingresa en detalle del concepto
And usuario desactiva opción stock ilimitado
And se actualiza stock a 0
And usuario clickea en <tipo_edición> en edita en 1 el stock
And se actualiza modal indicando nuevo stock
And  usuario confirma la edición
Then se actualiza el detalle del concepto con nuevo el stock
And al intentar registrar un pago en portal se ve el nuevo stock
And al intentar registrar un pago en dashboard se ve el nuevo stock

Example:
| tipo_edición |
| incrementa   |
| decrementa | 


Scenario Outlines: Cliente agrega inventario para una concepto opcional CON variantes
Given existe concepto opcional con variantes con stock 2
And usuario con permisos para editar stock
When usuario ingresa en detalle del concepto
And ingresa a sidepanel de variante
And usuario clickea en <tipo_edición> en edita en 1 el stock
And se actualiza modal indicando nuevo stock
And  usuario confirma la edición
Then se actualiza el detalle del concepto con nuevo el stock.
And al intentar registrar un pago en portal se ve el nuevo stock
And al intentar registrar un pago en dashboard se ve el nuevo stock

Example:
| tipo_edición |
| incrementa   |
| decrementa |

Scenario Outlines: Cliente agrega inventario para una concepto opcional CON variantes configurado con stock ilimitado
Given existe concepto opcional con variantes con stock ilimitado
And usuario con permisos para editar stock
When usuario ingresa en detalle del concepto
And ingresa a sidepanel de variante
And usuario desactiva opción stock ilimitado
And se actualiza stock a 0
And usuario clickea en <tipo_edición> en edita en 1 el stock
And se actualiza modal indicando nuevo stock
And  usuario confirma la edición
Then se actualiza el detalle del concepto con nuevo el stock
And al intentar registrar un pago en portal se ve el nuevo stock
And al intentar registrar un pago en dashboard se ve el nuevo stock

Example:
| tipo_edición |
| incrementa   |
| decrementa | 

Scenario: Usuario no puede editar stock si tiene activo la opción stock ilimitado
Given existe concepto opcional con stock ilimitado
And usuario con permisos para editar stock
When usuario ingresa en detalle del concepto
And ingresa a sidepanel de variante
Then estan deshabilitados los botones para incrementar o decrementar el stock