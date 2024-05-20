Feature: Como colegio queremos asignar ordens a nuestros estudiantes desde la tab estudiantes asignados en detalle de concepto

Scenario: Asigno 1 orden de concepto obligatorio con varias ordenes a estudiante desde tab estudiantes del concepto
Given existe un alumno sin la orden 1 asignada
And el usuario del colegio tiene permisos de asignacion de conceptos 
And el usuario puedo ingresar en la tab estudiantes asignados del concepto
When el usuario puede abrir el sidepanel de asignación de conceptos
And selecciona la orden 2 y graba el cambio
Then se incrementa en 1 en tabla estudiantes asignados la columna ordenes pagadas

Scenario: Asigno 1 variante de concepto opcional con 2 ordenes a estudiante desde tab estudiantes del concepto
Given existe un alumno con 1 variante de concepto asignada
And el usuario del colegio tiene permisos de asignacion de conceptos 
And el usuario puedo ingresar en la tab estudiantes asignados del concepto
When el usuario puede abrir el sidepanel de asignación de conceptos
And selecciona la variante 2 y graba el cambio
Then al volver a abrir el sidepanel de asignación de conceptos se ven las variantes asignadas

Scenario: No puedo desasignar una orden con pago parcial o completo de concepto obligatorio
Given existe un alumno con pago parcial de la orden
And el usuario del colegio tiene permisos de asignacion de conceptos 
And el usuario puedo ingresar en la tab estudiantes asignados del concepto
When el usuario puede abrir el sidepanel de asignación de conceptos
Then las ordenes estan deshabilitadas
And al hacer hover se muestra leyenda indicando que ya tiene un pago registrado

Scenario: No puedo desasignar todas las ordenes de concepto obligatorio
Given existe un alumno con pago parcial de la orden
And el usuario del colegio tiene permisos de asignacion de conceptos 
And el usuario puedo ingresar en la tab estudiantes asignados del concepto
When el usuario puede abrir el sidepanel de asignación de conceptos
And el usuario deshabilita todas las ordenes
Then se deshabilita el boton para grabar la edicion
And al hacer hover se muestra leyenda indicando que es necesario tener al menos 1 orden asignada

Scenario: Puedo desasignar una orden con pago completo de concepto opcional
Given existe un alumno con pago completo de la orden
And el usuario del colegio tiene permisos de asignacion de conceptos 
And el usuario puedo ingresar en la tab estudiantes asignados del concepto
When el usuario puede abrir el sidepanel de asignación de conceptos
And se muestra la orden con la leyenda que tiene un pago habilitada
And el usuario puede deshabilitar la orden y guardar la edicion
Then al volver a abrir el sidepanel de asignación de conceptos no tiene ordenes asignadas
