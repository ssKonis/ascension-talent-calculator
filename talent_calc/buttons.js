/* TODOS
 refactor code:
  merge load events
  get rid of self reference, use arrow functions
  Desktop Layout:
    choose different background for abilities
    refactor talent and ability loader
    add horitonzal scroll boxes for abilities, dont allow size to be laarger than talent trees

  Both:
    Display Tooltips -use jquery plugin 'tooltipster'
    Design better layout
    get resourceCounter to display how many talent/ability points have been spent aswell as level required
  Finish resource counter:
    add ability to reset abilities and talents

 */
var SELECTED = {
  class: 'mage',
  update: function (next) {
    this.class = next;
    let classChanged = new Event('classChanged')
    document.dispatchEvent(classChanged)
  }
};

var MODAL, HEADER, FOOTER;

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
  class_icon: 'https://data.project-ascension.com/files/images/icons/classes/', // + image_name + .png
  talentEssenceIcon: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAOAA4DASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAwUGB//EACIQAAMAAgICAgMBAAAAAAAAAAECAwQGBRIHEQgTISIkMv/EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAHREAAgEEAwAAAAAAAAAAAAAAAREDAAIEIRITQf/aAAwDAQACEQMRAD8Am/i1wPkvz1rGbhcF5O2PX78TnPAQTksrGw4Y0pgY05FK9V7M7IZTkFVIqxIPoUXeXMDZte3E6ttGyZ24wxYimRLmOVvn4+PlAL6+mFy/odaOBY9i37AGRDzOG+IflRm+B+QzDiLl0ysi8b5FIhAK461n/KPf+A0g5NfTMGCKgQfY1A858j575uz85yMc63IvCs62P1hKDunWip+WmX6lmmHZFcuU9B+q110kRx+KCQ826GtEnYwds1//2Q==',
  abilityEssenceIcon: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAOAA4DASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABgf/xAAiEAACAgEEAgMBAAAAAAAAAAABAgMEBQYHERIIEwAhIhT/xAAVAQEBAAAAAAAAAAAAAAAAAAAFBv/EAB4RAAIBAwUAAAAAAAAAAAAAAAEDEQASIQJBUXGR/9oADAMBAAIRAxEAPwAt4y4bcne2fNYjBbn6k07Jhbs0davDl7UdKvDDyIIin2ihjIEWOP8AISu3aPkKWnvmbX1foaOrpLNawy2qrFW1HJabNZaezBDKID0/ngsOQQwdy057MWBRREqsZwm0vlNe2QzVjN4jGjIZDLzGSWSzIY+lBZjzXULyAz+sEue3HVQB+nLEt292shv3kxYyRks3YZGKTyFK6tECeG9aq3R3ZmdlVuvYs32zE/HtbVlFo4EYz7VkGKKQCBbA2zPdf//Z'

}

var resourceCounter = {
  //Max TP = 51, max AP = 59, max level = 60
  talentPointsRequired: { current: 0, max: 5, maxed: false },
  abilityPointsRequired: { current: 0, max: 5, maxed: false },
  levelRequired: { current: 0, max: 60 },
  levelCostCandidates: [],
  updateCounter: function (tooltip, operation = 'add', multiplier = 1) {
    this.updateEssence(tooltip, operation, multiplier)
    this.updateLevel(tooltip, operation, multiplier)
  },
  updateEssence: function (tooltip, operation, multiplier) {
    let a = tooltip.abilityEssenceCost * multiplier
    let t = tooltip.talentEssenceCost * multiplier

    if (operation == 'remove') {
      a = a * -1
      t = t * -1
    }

    this.abilityPointsRequired.current += a
    this.talentPointsRequired.current += t

    //checkmax
    this.triggerCounterChange();

  },
  updateLevel: function (tooltip, operation, multiplier) {
    let level = parseInt(tooltip.levelReq.split(' ')[2]);
    if (operation == 'add') {
      this.levelCostCandidates.push(level)
    }
    if (operation == 'remove') {
      for (let k = 0; k < multiplier; k++) {
        for (let i = 0; i < this.levelCostCandidates.length; i++) {
          //remove first instance of that level
          if (this.levelCostCandidates[i] == level) {
            this.levelCostCandidates.splice(i, 1);
            break;
          }
        }
      }
    }
    let maxLevel = Math.max(...this.levelCostCandidates)
    this.levelRequired.current = (maxLevel > 0) ? maxLevel : 1;
    this.triggerCounterChange()
  },
  triggerCounterChange: function () {
    let event = new Event('CounterChanged')
    event.T = this.talentPointsRequired
    event.A = this.abilityPointsRequired
    event.L = this.levelRequired
    document.dispatchEvent(event)
  },

}
$(document).ready(function () { //check document is loaded
  /* Get Locations from JSON FIle*/
  (function getMap() { //IIFE
    let talent_map = []
    let ability_map = []

    /*Get locations*/
    $.getJSON("talents.json", function (talent) {
      talent.forEach(element => {
        talent_map.push(element);
      });

      $.getJSON("abilities.json", function (ability) {
        ability.forEach(element => {
          ability_map.push(element);
        });

        main(talent_map, ability_map) // Run after JSON loaded
      })

    })

  })()
});

//Holds information about required level, talent points spent and ability points spent

//Talent Tree object
function Tree(class_name, spec_name, element, index, target) {
  this.class_name = class_name
  this.spec_name = spec_name
  this.body = element;
  this.image = EVOWOW_API.background_image + class_name + '_' + index + '.jpg'
  /*Update background image css*/
  this.target = target;

  this.grid;

  this.spellObjects = { values: [], type: '' } // Holds all talents or abilities related to tree

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
      let ability = new Ability(item.id, self.grid[i], item.image)
      self.spellObjects.values.push(ability)
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
        self.spellObjects.values.push(talent)
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

  document.addEventListener('CounterChanged', (e) => {
    let t = e.T.current;
    let tx = e.T.max;
    let tOffset = tx - t;

    let a = e.A.current;
    let ax = e.A.max;
    let aOffset = ax - a;

    this.spellObjects.values.forEach((object) => {
      let ty = object.toolTipContent.talentEssenceCost
      let ay = object.toolTipContent.abilityEssenceCost
      // Work out if there are enough points left to spend on an talent or ability or
      if ((ay > aOffset) || (ty > tOffset)) {
        //If Not, lock that icon
        object.locked = true;
      }
      else {
        object.locked = false;
      }
    })

  })

}
function Spell() {
  //Parent class of abilities and talents
}
Spell.prototype.createImageElement = function (self) { //Create Image Element
  let img = document.createElement("img")
  img.src = ASCENSION_API.spell_icon + self.image;
  $(img).css('filter', 'grayscale(100)') /* make image grayscale*/
  self.element.appendChild(img)
}
Spell.prototype.createToolTipActivator = function (self) {
  if (self.tooltipActivator != undefined) {
    //If tooltip was previously created, remove that tooltip
    $(self.tooltipActivator).tooltipster('close');
  }
  let div = document.createElement("div")
  $(div).attr('class', 'tooltip-activator')
  self.element.appendChild(div)
  self.tooltipActivator = $(div)
}
Spell.prototype.updateToolTip = function (self) {
  self.createToolTipActivator(self)
  $(self.tooltipActivator).tooltipster({
    content: 'Loading...',
    functionBefore: function (instance, helper) {
      var $origin = $(helper.origin);
      if ($origin.data('loaded') != true) {
        let id = self.id
        let url = ASCENSION_API.spell_tooltip + id + '/tooltip.html'

        $.get(url, function (data) {
          self.requestToolTipMetaData(data)
          populateTooltip(self);
          instance.content($('.tooltip_content'))
          $origin.data('loaded', true);

        })

      }
    },
    contentCloning: true,
    animation: 'fade',
    triggerOpen: {
      mouseenter: true,
      touchstart: true,
    }


  })
  function populateTooltip(self) {
    let content = self.toolTipContent;
    //Fill tooltip with related metadata as divs
    $('.tooltip_content').empty();
    Object.keys(content).forEach(key => {
      let div = document.createElement("div")
      $(div).append(content[key])
      $('.tooltip_content').append(div)
    })

    {
      let img = document.createElement("img")
      img.src = ASCENSION_API.talentEssenceIcon
      let div = document.createElement('div')
      $(div).append(img)
      $('.tooltip_content > div:nth-child(5)').after(div)
    }
    {
      let img = document.createElement("img")
      img.src = ASCENSION_API.abilityEssenceIcon
      let div = document.createElement('div')
      $(div).append(img)
      $('.tooltip_content').append(div)
    }

  }
}
Spell.prototype.requestToolTipMetaData = function (data) {
  let content = {} //Get Meta data
  content.name = $(data).find('.ascension-tooltip-spell-name').text();
  content.rank = $(data).find('.ascension-tooltip-spell-rank').text();
  content.levelReq = $(data).find('.ascension-tooltip-spell-level-requirement').text();
  content.description = $(data).find('.ascension-tooltip-spell-tooltip-text').text();

  let essenceCost = $(data).find('.ascension-tooltip-spell-essence-cost').text();
  content.abilityEssenceCost = parseInt(essenceCost.split(' ')[16])
  content.talentEssenceCost = parseInt(essenceCost.split(' ')[18])
  this.toolTipContent = content;

}
Spell.prototype.initToolTip = function (self) {
  self.updateToolTip(self);
  let url = ASCENSION_API.spell_tooltip + self.id + '/tooltip.html'
  $.ajax({
    url: url,
    success: function (data) {
      self.requestToolTipMetaData(data);
    }
  })
}
//Ability Blue Print
function Ability(id, element, image) {
  this.id = id
  this.image = image
  this.element = element;

  let self = this;
  this.createImageElement(self);

  this.tooltipActivator
  this.toolTipContent
  this.locked = false;

  this.curRank = 0;
  this.nRanks = 1;

  this.initToolTip(self)
  element.loadEvents = function () {

    /*Prevent dev tool inspect on right click*/
    this.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    /*Handle left click and right click for desktop*/
    this.onmousedown = function (event) {
      if (event.which == 1 && self.locked == false && self.curRank == 0) {
        /* Add point on left click and remove gray filter*/
        $().find('img').css('filter', 'none')
        resourceCounter.updateCounter(self.toolTipContent)
        self.curRank = 1;

      }
      if (event.which == 3 && self.curRank == 1) {
        /* Remove point on right click*/
        resourceCounter.updateCounter(self.toolTipContent, 'remove')
        $(this).find('img').css('filter', 'grayscale(100)')
        self.curRank = 0;
      }
    }
    /*Handle touch hold for mobile users */

    let timer, lockTimer;
    let start_touch, end_touch;
    let touchduration = 600; //length of time we want the user to touch before we do something
    let touchstart = (e) => {
      /*On Each click, add an element */
      start_touch = e.changedTouches[0];
      if (self.curRank < self.nRanks && self.locked == false) {
        self.curRank += 1;
        resourceCounter.updateCounter(self.toolTipContent)

        $(this).find('img').css('filter', 'none')
      }

      e.preventDefault();
      if (lockTimer) {
        return;
      }
      timer = setTimeout(onlongtouch, touchduration);
      lockTimer = true;
    }

    let touchend = (e) => {
      //This prevents accidental selecting of icons when scrolling
      end_touch = e.changedTouches[0];
      let x_distance = start_touch.clientX - end_touch.clientX
      let y_distance = start_touch.clientY - end_touch.clientY

      if (Math.abs(x_distance || y_distance) > 50) {
        $(this).find('img').css('filter', 'grayscale(100)')
        self.curRank -= 1;
        resourceCounter.updateCounter(self.toolTipContent, 'remove')
      }
      //stops short touches from firing the event
      if (timer) {
        clearTimeout(timer); // clearTimeout, not cleartimeout..
        lockTimer = false;
      }
      else {
      }
    }

    let onlongtouch = () => {
      let mult = (0 - self.curRank) * -1
      self.curRank = 0
      resourceCounter.updateCounter(self.toolTipContent, 'remove', mult)
      $(this).find('img').css('filter', 'grayscale(100)')

    }
    element.addEventListener("touchstart", touchstart, false);
    element.addEventListener("touchend", touchend, false);
  }
  element.loadEvents(self);

}
Ability.prototype = Object.create(Spell.prototype)

//Talent Blue Print
function Talent(id, element, nRanks, image) {
  this.id = id;
  this.image = image;
  this.element = element;

  let self = this
  this.createImageElement(self);

  //add toltip
  this.tooltipActivator
  this.toolTipContent;
  this.locked = false;

  this.initToolTip(self)

  this.nRanks = nRanks;
  this.curRank = 0;
  // Add Rank Box
  $(this.element).append("<div class=rankBox>" + this.curRank + " / " + this.nRanks + "</div>")


  this.states = [] // Holds array of ids for each rank
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
  element.loadEvents = function () {

    /*Prevent dev tool inspect on right click*/
    this.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    /*Handle left click and right click for desktop*/
    this.onmousedown = function (event) {
      if (event.which == 1 && self.locked == false) {
        /* Add point on left click and remove gray filter*/
        $(this).find('img').css('filter', 'none')
        if (self.curRank < self.nRanks) {
          self.curRank += 1;
          updateState(self, self.curRank)
          self.updateToolTip(self)
          resourceCounter.updateCounter(self.toolTipContent)
          $(this).find('.rankBox').html("<div class=rankBox>" + self.curRank + " / " + self.nRanks + "</div>")
        }

      }
      if (event.which == 3) {
        /* Remove point on right click*/
        if (self.curRank > 0) {
          self.curRank -= 1;
          updateState(self, self.curRank)
          self.updateToolTip(self)
          resourceCounter.updateCounter(self.toolTipContent, 'remove')


          $(this).find('.rankBox').html("<div class=rankBox>" + self.curRank + " / " + self.nRanks + "</div>")
          /* If rank == 0, add greyscale filter */
          if (self.curRank == 0) {
            $(this).find('img').css('filter', 'grayscale(100)')
          }
        }
      }
    }
    /*Handle touch hold for mobile users */

    let timer, lockTimer;
    let start_touch, end_touch;
    let touchduration = 2000; //length of time we want the user to touch before we do something
    let touchstart = (e) => {
      /*On Each click, add an element */
      start_touch = e.changedTouches[0];
      if (self.curRank < self.nRanks && self.locked == false) {
        self.curRank += 1;
        updateState(self, self.curRank)
        self.updateToolTip(self)
        resourceCounter.updateCounter(self.toolTipContent)

        $(this).find('img').css('filter', 'none')
        $(this).find('.rankBox').html("<div class=rankBox>" + self.curRank + " / " + self.nRanks + "</div>")
      }

      e.preventDefault();
      if (lockTimer) {
        return;
      }
      timer = setTimeout(onlongtouch, touchduration);
      lockTimer = true;
    }

    let touchend = (e) => {
      //This prevents accidental selecting of icons when scrolling
      end_touch = e.changedTouches[0];

      let x_distance = start_touch.clientX - end_touch.clientX
      let y_distance = start_touch.clientY - end_touch.clientY
      if (Math.abs(x_distance || y_distance) > 50) {
        $(this).find('img').css('filter', 'grayscale(100)')
        self.curRank -= 1;
        $(this).find('.rankBox').html("<div class=rankBox>" + self.curRank + " / " + self.nRanks + "</div>")
        resourceCounter.updateCounter(self.toolTipContent, 'remove')
      }
      //stops short touches from firing the event
      if (timer) {
        clearTimeout(timer); // clearTimeout, not cleartimeout..
        lockTimer = false;
      }
      else {
      }
    }

    let onlongtouch = () => {
      console.log('long trigger')
      /* on long hold, remove all points from an icon*/
      // show tooltip
      // let mult = (0 - self.curRank) * -1
      // self.curRank = 0
      // resourceCounter.updateCounter(self.toolTipContent, 'remove', mult)
      // $(this).find('.rankBox').html("<div class=rankBox>" + self.curRank + " / " + self.nRanks + "</div>")
      // $(this).find('img').css('filter', 'grayscale(100)')

    }

    element.addEventListener("touchstart", touchstart, false);
    element.addEventListener("touchend", touchend, false);
  }


  /* On mouse over show tooltip */
  element.onmouseover = () => {
  }
  element.loadEvents();
}
Talent.prototype = Object.create(Ability.prototype);

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
    $(parent).append('<div class="resourceCounter"></div>')
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
      /*Close modal after selecting a new class*/
      SELECTED.update(name)
    }
  }
}

function Footer() {

  this.initDesktop = function () {
    createElements('header > .resourceCounter')
    removeElements('footer')
  }
  this.initMobile = function () {
    createElements('footer')
    removeElements('header > .resourceCounter')
  }

  function createElements(parent) {
    $(parent).append('<div> AP/TP <div id="abilityPointsCounter">  0 </div>  <div id="talentPointsCounter"> 0 </div>  </div>')
    $(parent).append('<div> Reset </div>')
    $(parent).append('<div> Level <div id ="levelCounter"> 1 </div>  </div>')
  }
  function removeElements(parent) {
    $(parent).empty();
  }


  document.addEventListener('CounterChanged', (e) => {
    $('#abilityPointsCounter').text(e.A.current)
    $('#talentPointsCounter').text(e.T.current)
    $('#levelCounter').text(e.L.current)
  })

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

function main(talent_map, ability_map) {
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

  document.addEventListener('classChanged', function () {
    dispatchMapContent();
    MODAL.hide();
  })

  function dispatchMapContent() {
    /*This function passes the data from the talent and ability map to each icon constructor*/
    let class_name = SELECTED.class;

    //Load Ability Data
    let abilityClassData = ability_map.filter(ability => ability.class_name == class_name);
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
      let talentdata = talent_map.slice(start, end)
      let spec_name = TREE_NAMES[class_name][i]
      let talentTree = new Tree(class_name, spec_name, talentTrees[i], i + 1, '.talents')
      talentTree.loadCells(n)
      talentTree.createTalentIcons(talentdata)
      talentTree.loadBackground()
    }


  }




}



