/* TODOS
 fix layout
 refactor code
 add abilities to desktop layout
  Desktop Layout:
    Display abilities on left hand side
    Make Header display all class icons and footer information
    display abilities vertically
    choose different background for abilities
  

  
 
 */


var talentMap = []
var abilityMap = []

var class_names = ['druid', 'hunter', 'mage', 'paladin', 'priest', 'rogue', 'shaman', 'warlock', 'warrior'];


var tree_names = {
  'druid': ['Balance', 'Feral', 'Restoration'],
  'hunter': ['Beast Mastery', 'Marksmanship', 'Survival'],
  'mage': ['Arcane', 'Fire', 'Frost'],
  'paladin': ['Holy', 'Protection', 'Retribution'],
  'priest': ['Discipline', 'Holy', 'Shadow'],
  'rogue': ['Assassination', 'Combat', 'Subtlety'],
  'shaman': ['Elemental', 'Enhancement', 'Restoration'],
  'warlock': ['Affliction', 'Demonology', 'Destruction'],
  'warrior': ['Arms', 'Fury', 'Protection']
}


var legacy_wow_api = {
  // append class name and talent tree index. e.g balance druid = 'druid0.png'
  spec_icon: 'https://legacy-wow.com/talentcalcs/vanilla/shared/global/talents/images/talents/trees/'
}

/* Get Locations from JSON FIle*/
function getMap() {
  /*Get locations*/
  $.getJSON("talents.json", function (talent) {
    talent.forEach(element => {
      talentMap.push(element);
    });

    $.getJSON("abilities.json", function (ability) {
      ability.forEach(element => {
        abilityMap.push(element);
      });
      let event = new Event('mapLoaded');
      document.dispatchEvent(event);

    })

  })

}

//Talent Tree object
function Tree(class_name, spec_name, element, index, target) {
  this.class_name = class_name
  this.spec_name = spec_name
  this.body = element;
  this.image = 'https://wotlk.evowow.com/static/images/wow/talents/backgrounds/' + class_name + '_' + index + '.jpg'
  /*Update background image css*/
  $(this.body).css('background-image', 'url(' + this.image + ')');
  this.target = target;
  let self = this;

  function buildHeader() {
    /*Assigns the correct header name to each tree*/
    let s = tree_names[class_name].indexOf(spec_name);
    let header = $('.trees' + self.target + ' > .spec-banner')[s % 3];
    $(header).empty();
    console.log(s % 3)
    let logo = legacy_wow_api.spec_icon + class_name + (s % 3) + '.png' //get icon
    $(header).append('<img src=' + "'" + logo + "'" + '/>')
    $(header).append('<div>' + spec_name + '</div>') /*Add Name of spec*/
    $(header).append('<span class="close">&times;' + '</span>')

  }
  buildHeader();

}

//ClassIcon Blue Print
function ClassIcon(name, element, modalId) {
  this.name = name;
  this.element = element;
  this.image = 'https://data.project-ascension.com/files/images/icons/classes/' + name + '.png';
  element.src = this.image;
  element.name = name /*Image name*/

  element.onclick = function () {
    loadBackground(element.name, '.talents'); /*Load background images*/
    loadBackground(element.name, '.abilities'); /*Load background images*/

    loadTalents(name);
    loadAbilities(name);
    /*Close modal*/
    $('#' + modalId).toggle();

    $('#selectedClassIcon').attr('src', element.src)/*Change icon image*/
    selected_class = element.name;
  }

}

//Ability Blue Print
function Ability(id, element) {
  this.id = id;
  let self = this;
  this.element = element;

  let imageElement = $(this.element);;
  $(imageElement).css('filter', 'grayscale(100)') /* make image grayscale*/

  this.loadEvents = function () {

    /*Prevent dev tool inspect on right click*/
    element.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    /*Handle left click and right click for desktop*/
    element.onmousedown = function (event) {
      if (event.which == 1) {
        /* Add point on left click and remove gray filter*/
        $(imageElement).css('filter', 'none')
        getToolTip(self)
        $('.tooltip').show()

      }
      if (event.which == 3) {
        /* Remove point on right click*/
        getToolTip(self)
        $(imageElement).css('filter', 'grayscale(100)')
      }
    }

    /*Handle touch hold for mobile users */

    let onlongtouch;
    let timer, lockTimer;
    let touchduration = 600; //length of time we want the user to touch before we do something
    function touchstart(e) {
      /*On Each click, add an element */

      $(imageElement).css('filter', 'none')

      e.preventDefault();
      if (lockTimer) {
        return;
      }
      timer = setTimeout(onlongtouch, touchduration);
      lockTimer = true;
    }

    function touchend() {
      //stops short touches from firing the event
      if (timer) {
        clearTimeout(timer); // clearTimeout, not cleartimeout..
        lockTimer = false;
      }
      else {
      }
    }

    onlongtouch = function () {
      /* on long hold, remove all points from an icon*/
      console.log('Hold Triggered')
      // show tooltip

      $(imageElement).css('filter', 'grayscale(100)')
    }

    element.addEventListener("touchstart", touchstart, false);
    element.addEventListener("touchend", touchend, false);
  }

  getToolTip = function (self) {
    let id = self.id
    let url = 'https://data.project-ascension.com/api/spells/' + id + '/tooltip.html'

    let request = $.ajax({
      url: url,
      type: 'GET',
      dataType: 'html'
    });

    request.done(function (msg) {
      // console.log($(msg).find('.ascension-tooltip-spell-tooltip-text').text());
    })
  }
  /* On mouse over show tooltip */
  element.onmouseover = function () {
    getToolTip(self)
  }
  this.loadEvents(self);

}

//Talent Blue Print
function Talent(id, element, nRanks) {
  this.id = id;
  let self = this
  this.element = element;
  this.states = [] // Holds array of ids for each rank

  let imageElement = $(this.element).first().children();
  $(imageElement).css('filter', 'grayscale(100)') /* make image grayscale*/

  this.tooltip = "Example Text";
  this.nRanks = nRanks;
  let curRank = 0;

  // Add Rank Box
  $(this.element).append("<div class=rankBox>" + curRank + " / " + nRanks + "</div>")


  updateState = function (self, index) {
    if (index > 0) {
      index -= 1
    }
    else (
      index = 0
    )
    self.id = self.states[index].id
    self.curRank = self.states[index].rank
  }
  this.loadEvents = function () {

    /*Prevent dev tool inspect on right click*/
    element.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    /*Handle left click and right click for desktop*/
    element.onmousedown = function (event) {
      if (event.which == 1) {
        /* Add point on left click and remove gray filter*/
        $(imageElement).css('filter', 'none')
        if (curRank < nRanks) {
          curRank += 1;
          updateState(self, curRank)
          getToolTip(self)
          $('.tooltip').show()
          $(this).find('.rankBox').html("<div class=rankBox>" + curRank + " / " + nRanks + "</div>")
        }

      }
      if (event.which == 3) {
        /* Remove point on right click*/
        if (curRank > 0) {
          curRank -= 1;
          updateState(self, curRank)
          getToolTip(self)

          $(this).find('.rankBox').html("<div class=rankBox>" + curRank + " / " + nRanks + "</div>")
          /* If rank == 0, add greyscale filter */
          if (curRank == 0) {
            $(imageElement).css('filter', 'grayscale(100)')
          }
        }
      }
    }

    /*Handle touch hold for mobile users */

    let onlongtouch;
    let timer, lockTimer;
    let touchduration = 600; //length of time we want the user to touch before we do something
    function touchstart(e) {
      /*On Each click, add an element */

      $(imageElement).css('filter', 'none')
      if (curRank < nRanks) {
        curRank += 1;
        $(this).find('.rankBox').html("<div class=rankBox>" + curRank + " / " + nRanks + "</div>")
      }

      e.preventDefault();
      if (lockTimer) {
        return;
      }
      timer = setTimeout(onlongtouch, touchduration);
      lockTimer = true;
    }

    function touchend() {
      //stops short touches from firing the event
      if (timer) {
        clearTimeout(timer); // clearTimeout, not cleartimeout..
        lockTimer = false;
      }
      else {
      }
    }

    onlongtouch = function () {
      /* on long hold, remove all points from an icon*/
      console.log('Hold Triggered')
      // show tooltip

      curRank -= 1;
      $(element).find('.rankBox').html("<div class=rankBox>" + curRank + " / " + nRanks + "</div>")
      $(imageElement).css('filter', 'grayscale(100)')
    }

    element.addEventListener("touchstart", touchstart, false);
    element.addEventListener("touchend", touchend, false);
  }

  getToolTip = function (self) {
    let id = self.id
    let url = 'https://data.project-ascension.com/api/spells/' + id + '/tooltip.html'

    let request = $.ajax({
      url: url,
      type: 'GET',
      dataType: 'html'
    });

    request.done(function (msg) {
      // console.log($(msg).find('.ascension-tooltip-spell-tooltip-text').text());
    })
  }
  /* On mouse over show tooltip */
  element.onmouseover = function () {
    getToolTip(self)
  }
  this.loadEvents(self);
}

function loadAbilities(selectedclass) {
  let classData = abilityMap.filter(ability => ability.class_name == selectedclass);
  for (let j = 0; j < 3; j++) {/*For each tree*/
    let spec_name = tree_names[selectedclass][j]
    // spec_name = spec_name.charAt(0).toUpperCase() + spec_name.slice(1)//capitalise first letter
    let specData = classData.filter(ability => ability.spec == spec_name)

    let selector = $('.trees.abilities').find('#tree' + j)
    $(selector).children().empty(); /*Clear previous talents*/

    let n = specData.length
    /*Dynamically generate icons*/
    for (let i = 0; i < n; i++) {
      $(selector).append('<div class="icon"></div>')
    }

    let grids = $(selector).children().toArray(); //Select empty grid elements


    specData.forEach(function (item, i) {
      let ability = new Ability(item.id, grids[i])
      let image_name = item.image;
      let imgElement = document.createElement("img");
      imgElement.src = 'https://data.project-ascension.com/files/images/icons/' + image_name;
      grids[i].appendChild(imgElement)
    })
  }
}
function loadTalents(selectedclass) {
  let n = 44; /* Number of grids per talent tree */

  let placeholder = class_names.indexOf(selectedclass) * n * 3;
  for (let j = 0; j < 3; j++) {/*For each tree*/
    let selector = $('.trees.talents').find('#tree' + j)

    $(selector).children().empty(); /*Clear previous talents*/

    /*Dynamically generate icons*/
    for (let i = 0; i < n; i++) {
      $(selector).append('<div class="icon"></div>')
    }

    let grids = $(selector).children().toArray();
    let p = placeholder + (j * n);
    for (let i = 0; i < n; i++) {
      let index = i + p;
      if (talentMap[index].data[0] != undefined) {
        let image_name = talentMap[index].data[0].image;
        let imgElement = document.createElement("img");
        imgElement.src = 'https://data.project-ascension.com/files/images/icons/' + image_name;
        grids[i].appendChild(imgElement)

        let id = talentMap[index].data[0].id;
        let element = grids[i];
        let maxRank = talentMap[index].max_rank;
        let talent = new Talent(id, element, maxRank)
        for (let k = 0; k < maxRank; k++) {
          let state = {}
          if (talentMap[index].data[k] == undefined) {
            state.id = talentMap[index].data[0].id + k;
            state.rank = talentMap[index].data[0].rank + k;
          }
          else {
            state.id = talentMap[index].data[k].id
            state.rank = talentMap[index].data[k].rank
          }

          talent.states.push(state)
        }
      }
    }
  }
}

/*Load background*/
function loadBackground(class_name, target) {
  //Select div that holds talent trees and populate with relevant data

  let trees = $('.trees' + target + ' > .tree');
  for (let i = 0; i < 3; i++) {
    let spec_name = tree_names[class_name][i]
    let tree = new Tree(class_name, spec_name, trees[i], i + 1, target)
  }
}

function Modal(modalId) {
  this.modal = $('#' + modalId);
  this.isOpen = false;
  this.open_button
  this.toggle = function () {
    if (this.modal.isOpen) { //Close Modal
      this.modal.css('display', 'none');
      this.modal.isOpen = false;
    }
    else { //Open
      this.modal.css('display', 'block');
      this.modal.isOpen = true;
    }
  }

  this.initIcons = function () {
    // Get placeholder divs
    let elements = $('.modal-content').children().toArray();

    let ClassIcons = [];
    /* Replace placeholder with appropriate class icons and give click functionality*/
    for (let i = 0; i < class_names.length; i++) {
      let icon = new ClassIcon(class_names[i], elements[i], modalId)
      ClassIcons.push(icon);
    }
  }

}

function showTree(target) {
  $('.' + target).css('visibility', 'visible');
  $('.' + target).css('position', 'static');
}
function hideTree(target) {
  $('.' + target).css('visibility', 'hidden');
  $('.' + target).css('position', 'absolute');
}

function toggleTree(target) {
  if (target == 'abilities') {
    showTree('abilities')
    hideTree('talents')
  }
  else if (target == 'talents') {
    showTree('talents')
    hideTree('abilities')
  }
}

function Page() {
  function myFunction(desktopSize) {
    if (desktopSize.matches) { // If media query matches
      showTree('abilities')
    } else {
      showTree('talents')
      hideTree('abilities')

    }
  }

  var desktopSize = window.matchMedia("(min-width: 600px)")
  myFunction(desktopSize) // Call listener function at run time
  desktopSize.addListener(myFunction) // Attach listener function on state changes
}


getMap();
$(document).ready(function () { //check document is loaded
  /* Init Modal and class Icons */
  let classModal = new Modal('modal');
  classModal.initIcons();

  //Toggle modal display on ClassIcon click
  $('#selectedClassIcon').on('click', function () {
    classModal.toggle()
  })

  document.addEventListener('mapLoaded', function () {
    /* waits untill the map is loaded before other assets are loaded*/
    Page()

    /* Initialize Default Settings */
    let selected_class = 'druid';
    loadBackground(selected_class, '.talents');
    // loadBackground(selected_class, '.abilities');

    loadTalents(selected_class);
    loadAbilities(selected_class);

    $('.abilitiesBtn').on('click', function () {
      toggleTree('abilities')

    })
    $('.talentsBtn').on('click', function () {
      toggleTree('talents')

    })
  })


});


