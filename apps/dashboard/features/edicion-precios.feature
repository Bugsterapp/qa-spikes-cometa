Feature: Como colegio quiero tener una seccion en el detalle de cada concepto para poder editar el precio de cada orden o variante.

Scenario: Editar precio de una orden de concepto tipo colegiatura en forma exitosa
Given existe concepto tipo colegiatura
And usuario con permisos para editar precio
When usuario ingresa en detalle del concepto
And ingresa a la tab ordenes
And edita el precio de una orden
Then se muestra alerta con mensaje de exito
And se actualiza la tab ordenes con el nuevo precio de la orden editada
And se actualiza en el tab informacion general el costo de la orden editada

Scenario: Editar precio de una orden de concepto tipo colegiatura en forma exitosa que tiene un pago realizado
Given existe concepto tipo colegiatura
And existe alumno que pago la orden a editar
And usuario con permisos para editar precio
When usuario ingresa en detalle del concepto
And ingresa a la tab ordenes
And edita el precio de una orden
Then se muestra alerta con mensaje de exito
And se actualiza la tab ordenes con el nuevo precio de la orden editada
And se actualiza en el tab informacion general el costo de la orden editada