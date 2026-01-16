Feature: Como colegio queremos poder configurar la información del reporte en la sección pagos recibidos para simplificar la lectura del reporte completo

Scenario: Usuario descarga reporte completo sin tener configurado el personalizado
Given existe un usuario con permisos para descargar reportes
And existen pagos recibidos para descargar
And no existe un reporte personalizado para el usuario
When ingresa a la sección pagos recibidos
And despliega modal de descarga
And visualiza el botón de configurar reporte personalizado
Then descarga el reporte completo
And el reporte tiene todas las columnas del reporte original

Scenario: Usuario configura y descarga reporte personalizado por primera vez
Given existe un usuario con permisos para configurar reportes
And existen pagos recibidos para descargar
When el usuario ingresa a la sección pagos recibidos
And abre el modal de descarga
And visualiza el botón de configurar en el modal por no tener configurado ninguno
And hace clic en el botón de configurar
And se muestra la ventana para seleccionar columnas
And al hacer hover sobre boton guardar cambios ve el mensaje Selecciona al menos una columna
And selecciona las columnas #pago, Nombre del alumno, sección y pagador
And graba la selección de campos personalizada
Then descarga el reporte personalizado
And el reporte contiene solo las columnas #pago, Nombre del alumno, sección y pagador

Scenario: Usuario agrega campos a reporte personalizado configurado previamente y lo descarga
Given existe un usuario con permisos para configurar reportes
And existen pagos recibidos para descargar
And existe un reporte personalizado por el usuario para las columnas #pago, Nombre del alumno, sección y pagador
When ingresa a la sección pagos recibidos
And despliega el modal de descarga
And visualiza los botones de configurar y descargar reporte personalizado en el modal
And hace clic en el botón de configurar
And se muestra la ventana para seleccionar columnas
And agrega al reporte la columna apellido del alumno
And graba la selección de campos personalizada
Then descarga el reporte personalizado
And el reporte contiene las columnas #pago, Nombre del alumno, sección, pagador y apellido del alumno

Scenario: Usuario descarga reporte personalizado configurado previamente
Given existe un usuario con permisos para configurar reportes
And existen pagos recibidos para descargar
And existe un reporte personalizado por el usuario para las columnas #pago, Nombre del alumno, sección, pagador y apellido del alumno
When ingresa a la sección pagos recibidos
And despliega el modal de descarga
And visualiza los botones de configurar y descargar reporte personalizado en el modal
And descarga el reporte personalizado
Then el reporte contiene las columnas #pago, Nombre del alumno, sección, pagador y apellido del alumno

Scenario: Usuario descarga reporte completo teniendo configurado el reporte personalizado
Given existe un usuario con permisos para descargar reportes
And existen pagos recibidos para descargar
And existe un reporte personalizado por el usuario para las columnas #pago, Nombre del alumno, sección, pagador y apellido del alumno
When ingresa a la sección pagos recibidos
And despliega el modal de descarga
And visualiza los botones de configurar y descargar reporte personalizado en el modal
Then descarga el reporte completo
And el reporte tiene todas las columnas del reporte original

Scenario: Usuario descarga facturas desde modal de descargas
Given existe un usuario con permisos para descargar reportes
And existen pagos recibidos para descargar
And existe un reporte personalizado por el usuario para las columnas #pago, Nombre del alumno, sección, pagador y apellido del alumno
When ingresa a la sección pagos recibidos
And despliega el modal de descarga
And visualiza los botones de configurar y descargar reporte personalizado en el modal
Then descarga facturas
And se descargan todos los registros filtrados en un archivo zip con las facturas en formato xml y pdf

Scenario: Usuario filtra pagos recibidos y descarga reporte personalizado
Given existe un usuario con permisos para configurar reportes
And existen pagos recibidos para descargar
And existe un reporte personalizado por el usuario para las columnas #pago, Nombre del alumno, sección, pagador y apellido del alumno
When ingresa a la sección pagos recibidos
And filtra por tipo de concepto colegiatura
And despliega el modal de descarga
And visualiza los botones de configurar y descargar reporte personalizado en el modal
And descarga el reporte personalizado
Then el reporte contiene las columnas #pago, Nombre del alumno, sección, pagador y apellido del alumno
