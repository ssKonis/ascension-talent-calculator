/* TODOS
 refactor code
  Desktop Layout:
    choose different background for abilities
    refactor talent and ability loader

  Both:
    Display Tooltips -use jquery plugin 'tooltipster'
    Design better layout
    get tallybox to display how many talent/ability points have been spent aswell as level required
 
 */
var SELECTED = {
  class: 'druid',
  previous: null,
  update: function (next) {
    this.previous = this.class;
    this.class = next;
    let classChanged = new Event('classChanged')
    document.dispatchEvent(classChanged)
  }
};
var MODAL, HEADER, FOOTER;

var TALENT_MAP = []
var ABILITY_MAP = []

var CLASS_NAMES = ['druid', 'hunter', 'mage', 'paladin', 'priest', 'rogue', 'shaman', 'warlock', 'warrior'];

var TREE_NAMES = {
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

var LEGACY_WOW_API = {
  spec_icon: 'https://legacy-wow.com/talentcalcs/vanilla/shared/global/talents/images/talents/trees/' // + class_name + index + '.png'
}

var EVOWOW_API = {
  background_image: 'https://wotlk.evowow.com/static/images/wow/talents/backgrounds/' // + class_name + '_' + index + '.jpg'
}

var ASCENSION_API = {
  spell_tooltip: 'https://data.project-ascension.com/api/spells/',// + id + '/tooltip.html'
  spell_icon: 'https://data.project-ascension.com/files/images/icons/',// + image_name;
  class_icon: 'https://data.project-ascension.com/files/images/icons/classes/' // + image_name + .png

}

/* Get Locations from JSON FIle*/
function getMap() {
  /*Get locations*/
  $.getJSON("talents.json", function (talent) {
    talent.forEach(element => {
      TALENT_MAP.push(element);
    });

    $.getJSON("abilities.json", function (ability) {
      ability.forEach(element => {
        ABILITY_MAP.push(element);
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
  this.image = EVOWOW_API.background_image + class_name + '_' + index + '.jpg'
  /*Update background image css*/
  this.target = target;

  this.grid;

  let self = this;

  (function buildHeader() {
    /*Assigns the correct header name to each tree*/
    let s = TREE_NAMES[class_name].indexOf(spec_name);
    let header = $('.trees' + self.target + ' > .spec-banner')[s % 3];
    $(header).empty();
    let logo = LEGACY_WOW_API.spec_icon + class_name + (s % 3) + '.png' //get icon
    $(header).append('<img src=' + "'" + logo + "'" + '/>')
    $(header).append('<div>' + spec_name + '</div>') /*Add Name of spec*/
    $(header).append('<span class="close">&times;' + '</span>')
  })()

  this.loadBackground = function () {
    $(this.body).css('background-image', 'none') //Remove previous
    $(this.body).css('background-image', 'url(' + this.image + ')'); //Add new background
  }

  this.loadCells = function (n) {
    $(element).empty(); /*Clear previous talents*/
    /*Dynamically generate icons*/
    for (let i = 0; i < n; i++) {
      $(element).append('<div class="icon"></div>')
    }
    self.grid = $(element).children().toArray()

  }

  this.createAbilityIcons = function (data) {
    data.forEach(function (item, i) {
      new Ability(item.id, self.grid[i], item.image)
    })
  }

  this.createTalentIcons = function (data) {

    data.forEach(function (item, i) {
      if (item.data[0] != undefined) {
        let image = item.data[0].image;
        let id = item.data[0].id;
        let element = self.grid[i];
        let maxRank = item.max_rank;
        let talent = new Talent(id, element, maxRank, image)
        for (let k = 0; k < maxRank; k++) {
          let state = {}
          if (item.data[k] == undefined) {
            state.id = item.data[0].id + k;
            state.rank = item.data[0].rank + k;
          }
          else {
            state.id = item.data[k].id
            state.rank = item.data[k].rank
          }

          talent.states.push(state)
        }
      }
    })

  }
}
//Ability Blue Print
function Ability(id, element, image) {
  this.id = id;
  let self = this;
  this.element = element;
  this.image = image;

  (function () { //Create Image Element
    let img = document.createElement("img")
    img.src = ASCENSION_API.spell_icon + image;
    $(img).css('filter', 'grayscale(100)') /* make image grayscale*/
    element.appendChild(img)
  })()

  this.loadEvents = function () {

    /*Prevent dev tool inspect on right click*/
    element.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    /*Handle left click and right click for desktop*/
    element.onmousedown = function (event) {
      if (event.which == 1) {
        /* Add point on left click and remove gray filter*/
        $(this).find('img').css('filter', 'none')
        getToolTip(self)
        $('.tooltip').show()

      }
      if (event.which == 3) {
        /* Remove point on right click*/
        getToolTip(self)
        $(this).find('img').css('filter', 'grayscale(100)')
      }
    }

    /*Handle touch hold for mobile users */

    let onlongtouch;
    let timer, lockTimer;
    let touchduration = 600; //length of time we want the user to touch before we do something
    function touchstart(e) {
      /*On Each click, add an element */

      $(this).find('img').css('filter', 'none')

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

      $(this).find('img').css('filter', 'grayscale(100)')
    }

    element.addEventListener("touchstart", touchstart, false);
    element.addEventListener("touchend", touchend, false);
  }
  getToolTip = function (self) {
    let id = self.id
    let url = ASCENSION_API.spell_tooltip + id + '/tooltip.html'

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
function Talent(id, element, nRanks, image) {
  this.id = id;
  let self = this
  this.element = element;
  this.states = [] // Holds array of ids for each rank
  this.image = image;

  (function () { //Create Image Element
    let img = document.createElement("img")
    img.src = ASCENSION_API.spell_icon + image;
    $(img).css('filter', 'grayscale(100)') /* make image grayscale*/
    element.appendChild(img)
  })()

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
        $(this).find('img').css('filter', 'none')
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
            $(this).find('img').css('filter', 'grayscale(100)')
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

      $(this).find('img').css('filter', 'none')
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
      // show tooltip

      curRank -= 1;
      $(element).find('.rankBox').html("<div class=rankBox>" + curRank + " / " + nRanks + "</div>")
      $(this).find('img').css('filter', 'grayscale(100)')
    }

    element.addEventListener("touchstart", touchstart, false);
    element.addEventListener("touchend", touchend, false);
  }

  getToolTip = function (self) {
    let id = self.id
    let url = ASCENSION_API.spell_tooltip + id + '/tooltip.html'

    let request = $.ajax({
      url: url,
      type: 'GET',
      dataType: 'html'
    });

    request.done(function (msg) {
      console.log($(msg).find('.ascension-tooltip-spell-tooltip-text').text());
    })
  }
  /* On mouse over show tooltip */
  element.onmouseover = function () {
    getToolTip(self)
  }
  this.loadEvents(self);
}
function Header() {
  let self = this;
  this.initDesktop = function () {
    createDesktopElements('header')
  }
  this.initMobile = function () {
    createMobileElements('header')
  }
  function createDesktopElements(parent) {
    $(parent).empty();
    $(parent).append('<div class="tallyBox"></div>')
    $(parent).append('<div class="class-icon-container"></div>')

    showTree('abilities')
    self.loadIcons($(parent + ' .class-icon-container'))

  }
  function createMobileElements(parent) {
    $(parent).empty();
    let url = ASCENSION_API.class_icon + SELECTED.class + '.png'
    $(parent).append('<div class="talentsBtn">Talents</div>')
    $(parent).append('<div id="selectedClassIcon"><img class="classIcon" src ="' + url + '" alt = "class icon" ></div > ')
    $(parent).append('<div class="abilitiesBtn">Abilities</div>')

    // Display talent tree, hide abilities tree in mobile view
    showTree('talents')
    hideTree('abilities')

    // Add functionality to buttons
    $('.talentsBtn').on('click', function () {
      toggleTree('talents')
    })
    $('#selectedClassIcon').on('click', function () {
      MODAL.toggle()
    })
    $('.abilitiesBtn').on('click', function () {
      toggleTree('abilities')
    })

    document.addEventListener('classChanged', function () {
      let url = ASCENSION_API.class_icon + SELECTED.class + '.png'
      $('#selectedClassIcon > img').attr('src', url)/*Change icon image*/
    })

  }

}
Header.prototype.loadIcons = function (target) {
  /* Create Icons and load them into header */
  let container = target
  for (let i = 0; i < 9; i++) {
    let name = CLASS_NAMES[i];
    container.append('<div><img class="classIcon" src="' + ASCENSION_API.class_icon + name + '.png" alt="class icon"></div>')

    /* Give Each icon a click handler that will load corresponding data*/
    $(container).children()[i].onclick = function () {

      // /*Instead of modifying page, send an event and have this chage on page object*/
      // loadBackground(name, '.talents'); /*Load background images*/

      // loadTalents(name);
      // loadAbilities(name);
      // /*Close modal after selecting a new class*/
      // MODAL.hide();

      // // SELECTED.class = name;
      // SELECTED.update(name)
    }
  }
}
function Footer() {

  this.initDesktop = function () {
    createElements('header > .tallyBox')
    removeElements('footer')
  }
  this.initMobile = function () {
    createElements('footer')
    removeElements('header > .tallyBox')
  }

  function createElements(parent) {
    $(parent).append('<div>Ability Points Remaining</div>')
    $(parent).append('<div>Level Required</div>')
    $(parent).append('<div>Talent Points Remaining</div>')
  }
  function removeElements(parent) {
    $(parent).empty();
  }
}
function Modal() {
  this.modal = $('#modal');
  this.isOpen = false;
  this.open_button
  let self = this;
  this.hide = function () {
    this.modal.css('display', 'none');
    this.modal.isOpen = false;
  }
  this.show = function () {
    this.modal.css('display', 'block');
    this.modal.isOpen = true;
  }
  this.toggle = function () {
    if (this.modal.isOpen) { //Close Modal
      self.hide()
    }
    else { //Open
      self.show()
    }
  }


}
Modal.prototype = Object.create(Header.prototype); //Give Load icons function to Modal

// Helper Functions
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

function main() {
  var state = window.matchMedia("(min-width: 600px)")

  dispatchMapContent();
  FOOTER = new Footer();
  HEADER = new Header();
  MODAL = new Modal();
  MODAL.loadIcons($('.modal-content')); //Load Modal Icons


  function setState(state) {
    if (state.matches) { // If desktop size
      initDesktopLayout()
    } else {
      initMobileLayout()
    }
  }
  function initDesktopLayout() {
    HEADER.initDesktop()
    FOOTER.initDesktop()
    MODAL.hide()
  }
  function initMobileLayout() {
    HEADER.initMobile()
    FOOTER.initMobile()
  }
  setState(state)
  state.addListener(setState)

  function dispatchMapContent() {
    /*This function passes the data from the talent and ability map to each icon constructor*/
    let class_name = SELECTED.class;

    //Load Ability Data
    let abilityClassData = ABILITY_MAP.filter(ability => ability.class_name == class_name);
    let abilityTrees = $('.trees' + '.abilities' + ' > .tree');
    for (let i = 0; i < 3; i++) {
      let spec_name = TREE_NAMES[class_name][i]
      let specData = abilityClassData.filter(ability => ability.spec == spec_name)
      let abilityTree = new Tree(class_name, spec_name, abilityTrees[i], i + 1, '.abilities')
      abilityTree.loadCells(specData.length)
      abilityTree.createAbilityIcons(specData)
    }

    //load Talent Data
    let n = 44 // number of grids in a talent tree
    let talentTrees = $('.trees' + '.talents' + ' > .tree');
    let p = CLASS_NAMES.indexOf(class_name) * n * 3; /*Used as an offset for determining icon locations*/
    for (let i = 0; i < 3; i++) {
      let start = ((i * n) + p);
      let end = (((i + 1) * n) + p);
      let talentdata = TALENT_MAP.slice(start, end)
      let spec_name = TREE_NAMES[class_name][i]
      let talentTree = new Tree(class_name, spec_name, talentTrees[i], i + 1, '.talents')
      talentTree.loadCells(n)
      talentTree.createTalentIcons(talentdata)
      talentTree.loadBackground()
    }
  }


}

getMap();
$(document).ready(function () { //check document is loaded

  document.addEventListener('mapLoaded', function () {
    /* waits untill the map is loaded before other assets are loaded*/
    main()
  })


});


