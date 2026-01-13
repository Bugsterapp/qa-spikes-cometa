Feature: Como colegio queremos poder visualizar nuestras becas y asignaciones y bajar reportes al respecto.

Scenario: Usuario dashboard visualiza en lista de becas 1 beca de tipo % con impacto en Colegiatura / Mensualidad
Given existe 1 concepto del tipo Colegiatura / Mensualidad
And existe la beca "BECA FAMILIAR 25%" que impacta a tipo de concepto Colegiatura / Mensualidad
And usuario del dashboard tiene acceso a seccion becas
When usuario ingresa al dashboard
And ingresa a seccion becas
Then visualiza en la tabla la beca "BECA FAMILIAR 25%"
And Valor dscto es %20
And Conceptos afectados es "Colegiatura / Mensualidad"

Scenario: Usuario ingresa en Resumen asignación con filtro por default del ciclo actual y visualiza el listado agrupado por beca.
Given existen becas configuradas para el colegio
And usuario del dashboard tiene acceso a seccion becas
When usuario ingresa al dashboard
And ingresa a seccion becas tab Resumen de asignaciones
Then por defecto esta selecccionado el cilco escolar actual
And la tabla se carga con cards por cada beca y estan desplegadas

Scenario: Usuario descarga un reporte de becas asignadas filtrando por nivel Primaria, beca "BECA FAMILIAR 25%" y ciclo actual 
donde el numero de alumnos es igual al de la tabla estudiantes con los mismo filtros.
Given Existen n alumnos con la beca "BECA FAMILIAR 25%" para el nivel "Primaria" para el ciclo actual
And los estudiantes estan en un estado distinto a Deleted.
When usuario ingresa al dashboard
And ingresa a seccion becas tab Resumen de asignaciones
And por defecto esta selecccionado el ciclo escolar actual
And selecciona "Primaria" en filtro nivel
And selecciona "BECA FAMILIAR 25%" en filtro becas
And descarga el reporte de becas
Then el numero de registros en el reporte es igual al resultado obtenido en la tabla estudiantes con los mismos filtros