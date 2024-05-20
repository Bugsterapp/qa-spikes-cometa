Feature: Como tutor quiere poder gestionar mis pagos parciales registrados en el colegio y completarlos desde portal.

Scenario: Tutor completa pago parcial de un concepto mensual
Given el colegio permite completar pagos parciales desde portal
And el tutor realizo un pago parcial en el colegio
When ingresa al home del portal
And selecciona la orden por pagar
And visualiza el detalle de la orden con el pago parcial
And el monto de la orden se actualizo con el pago parcial registrado
Then completa el pago de la orden
And visualiza el pago en historial de pagos, los completados parciales
And puede acceder a la factura de ambos pagos parciales en el mismo PDF

Scenario: Tutor completa pago parcial de otros conceptos
Given el colegio permite completar pagos parciales desde portal
And el tutor realizo un pago parcial en el colegio
When ingresa al home del portal
And ingresa en seccion otro conceptos
And selecciona la orden por pagar
And visualiza el detalle de la orden con el pago parcial
And el monto de la orden se actualizo con el pago parcial registrado
Then completa el pago de la orden
And visualiza el pago en historial de pagos, los completados parciales

Scenario: Tutor completa el pago de 2 ordenes parcialmente
Given el colegio permite completar pagos parciales desde portal
And el tutor realizo 2 pagos parciales en el colegio
When ingresa al home del portal
And selecciona las ordenes por pagar
Then completa el pago de las ordenes
And visualiza el pago en historial de pagos, los completados parciales

Scenario: Tutor realiza pago de 2 ordenes, 1 parcial y la otra completa
Given el colegio permite completar pagos parciales desde portal
And el tutor realizo 1 pago parcial en el colegio
And tiene por pagar otra orden completa
When ingresa al home del portal
And selecciona las ordenes por pagar
Then completa el pago de las ordenes
And visualiza el pago en historial de pagos, los completados parciales

Scenario: Tutor NO puede completar pago parcial
Given el colegio no permite completar pagos parciales desde portal
And el tutor realizo un pago parcial en el colegio
When ingresa al portal secion pagos en proceso
Then visualiza la orden pendiente sin posibilidad de pagarla