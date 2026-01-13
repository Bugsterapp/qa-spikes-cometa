Feature: Como tutor quiere poder editar mis datos personales desde el portal.

Scenario: Tutor edita sus datos personales desde portal
Given existe un tutor registrado
And el colegio al que pertenece permite editar datos del tutor
When el tutor accede al portal
And ingrese a editar sus datos personales
And edita el nombre
And edita el apellido
And edita el email
And edita el sexo
And graba con existo los cambios
Then ve sus cambios en el formulario deshabilitado

Scenario: Tutor no puede editar sus datos personales desde portal
Given existe un tutor registrado
And el colegio al que pertenece NO permite editar datos del tutor
When el tutor accede al portal
And ingrese a editar sus datos personales
Then el formulario esta deshabilitado

Scenario: Tutor con alumnos en 2 colegios distintos edita sus datos personales desde portal exitosamente
Given existe un tutor registrado
And uno de los colegios al que pertenece permite editar datos del tutor
And uno de los colegios al que pertenece NO permite editar datos del tutor
When el tutor accede al portal
And elije el colegio que permite edicion de datos
And ingrese a editar sus datos personales
And edita el nombre
And edita el apellido
And edita el email
And edita el sexo
And graba con existo los cambios
Then ve sus cambios en el formulario deshabilitado

Scenario: Tutor con alumnos en 2 colegios distintos edita sus datos personales desde portal exitosamente
Given existe un tutor registrado
And uno de los colegios al que pertenece permite editar datos del tutor
And uno de los colegios al que pertenece NO permite editar datos del tutor
When el tutor accede al portal
And elije el colegio que NO permite edicion de datos
And ingrese a editar sus datos personales
Then el formulario esta deshabilitado