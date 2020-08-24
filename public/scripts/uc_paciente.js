"use strict";

requirejs(["view_paciente, dao_paciente"], function() {
  const view = new ViewPaciente();
  view.init();
});

