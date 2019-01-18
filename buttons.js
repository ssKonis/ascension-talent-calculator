var SELECTED = {
  class: 'mage',
  update: function (next) {
    this.class = next;
    let classChanged = new Event('classChanged')
    document.dispatchEvent(classChanged)
  }
};

var savedIcons = new Set();

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
  talentPointsRequired: { current: 0, max: 51, maxed: false },
  abilityPointsRequired: { current: 0, max: 59, maxed: false },
  levelRequired: { current: 1, max: 60 },
  levelCostCandidates: [],
  validateTooltip: function (tooltip) {
    if (isNaN(tooltip.abilityEssenceCost)) {
      tooltip.abilityEssenceCost = 0
    }
    if (isNaN(tooltip.talentEssenceCost)) {
      if (tooltip.isTalent) {
        tooltip.talentEssenceCost = 1
      }
      else {
        tooltip.talentEssenceCost = 0
      }
    }
    if (tooltip.levelReq == '') {
      tooltip.levelReq = 'Requires level 1'
    }

    return tooltip
  },

  updateCounter: function (tooltip, operation = 'add', multiplier = 1) {
    tooltip = this.validateTooltip(tooltip)
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
    this.levelRequired.current = (maxLevel > 0) ? maxLevel : 1
    this.triggerCounterChange()
  },
  triggerCounterChange: function () {
    let event = new Event('CounterChanged')
    event.T = this.talentPointsRequired
    event.A = this.abilityPointsRequired
    event.L = this.levelRequired
    document.dispatchEvent(event)
  },
  reset: function () {
    this.talentPointsRequired.current = 0;
    this.abilityPointsRequired.current = 0;
    this.levelRequired.current = 1;
    this.levelCostCandidates = [];
    this.triggerCounterChange();

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
  function removeIconsBySpec() {
    self.spellObjects.values.forEach(obj => {
      if ($(this).attr('class') == ('close ' + spec_name)) { //If item matches spec tre
        if (obj.curRank > 0) { //If item had been selected
          let mult = (0 - obj.curRank) * -1
          resourceCounter.updateCounter(obj.toolTipContent, 'remove', mult)
          removeIcon(obj)
        }
      }
    })
    savedIcons.forEach((icon) => {
      if (icon.spec_name == self.spec_name
        && icon.class_name == self.class_name
        && ((icon instanceof Talent) && (self.target == '.talents')
          || ((icon instanceof Ability) && (self.target == '.abilities')))) {
        savedIcons.delete(icon)
      }
    }
    )
  }
  function buildHeader() {
    /*Assigns the correct header name to each tree*/
    let s = TREE_NAMES[class_name].indexOf(spec_name);
    let header = $('.trees' + self.target + ' > .spec-banner')[s % 3];
    $(header).empty();
    let logo = LEGACY_WOW_API.spec_icon + class_name + (s % 3) + '.png' //get icon
    $(header).append('<img src=' + "'" + logo + "'" + '/>')
    $(header).append('<div>' + spec_name + '</div>') /*Add Name of spec*/
    $(header).append('<span class="close ' + spec_name + '" >&times;' + '</span>')
    $(header).find('span').on('click', removeIconsBySpec)
  }
  buildHeader();


  this.loadBackground = function () {
    $(this.body).css('background-image', 'none') //Remove previous
    $(this.body).css('background-image', 'url(' + this.image + ')'); //Add new background
  }

  this.loadCells = (n) => {
    $(element).empty(); /*Clear previous talents*/
    /*Dynamically generate icons*/
    for (let i = 0; i < n; i++) {
      $(element).append('<div class="icon"></div>')
    }
    self.grid = $(element).children().toArray()

  }

  this.createAbilityIcons = (data) => {
    data.forEach((item, i) => {
      let ability = new Ability(item.id, this.grid[i], item.image, i, class_name, spec_name)
      this.spellObjects.values.push(ability)
    })
  }

  this.createTalentIcons = (data) => {

    data.forEach((item, i) => {

      if (item.data[0] != undefined) {
        let image = item.data[0].image;
        let id = item.data[0].id;
        let element = this.grid[i];
        let maxRank = item.max_rank;
        talent = new Talent(id, element, maxRank, image, i, class_name, spec_name)
        this.spellObjects.values.push(talent)
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

  const removeIcon = function (obj) {
    obj.curRank = 0;
    obj.toggleIconFilter('on');
    try {
      //If Talent Object
      obj.updateState()
      obj.updateRankBox()
    }
    catch (err) {
      //Skip if ability object
    }
  }

  document.addEventListener('resetAll', (e) => {
    this.spellObjects.values.forEach(obj => {
      removeIcon(obj);
    })
    resourceCounter.reset();
    savedIcons.clear();
  })

}
function Spell() {
  //Parent class of abilities and talents
}
Spell.prototype.createImageElement = function () { //Create Image Element
  let img = document.createElement("img")
  img.src = ASCENSION_API.spell_icon + this.image;
  $(img).css('filter', 'grayscale(100)') /* make image grayscale*/
  this.element.appendChild(img)
}
Spell.prototype.createToolTipActivator = function () {
  if (this.tooltipActivator != undefined) {
    //If tooltip was previously created, remove that tooltip
    $(this.tooltipActivator).tooltipster('close');
  }
  let div = document.createElement("div")
  $(div).attr('class', 'tooltip-activator')
  this.element.appendChild(div)
  this.tooltipActivator = $(div)
}
Spell.prototype.updateToolTip = function () {
  this.createToolTipActivator()
  $(this.tooltipActivator).tooltipster({
    content: 'Loading...',
    functionBefore: (instance, helper) => {

      var $origin = $(helper.origin);
      if ($origin.data('loaded') != true) {
        let id = this.id
        let url = ASCENSION_API.spell_tooltip + id + '/tooltip.html'

        $.get(url, (data) => {

          this.requestToolTipMetaData(data)
          populateTooltip(this);
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
    },


  })
  const populateTooltip = () => {
    let content = this.toolTipContent;
    //Fill tooltip with related metadata as divs
    $('.tooltip_content').empty();
    Object.keys(content).forEach(key => {
      if (key != 'isTalent') {
        let div = document.createElement("div")
        $(div).append(content[key])
        $('.tooltip_content').append(div)
      }
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
  content.isTalent = this instanceof Talent
  this.toolTipContent = content;

}
Spell.prototype.initToolTip = function () {
  this.updateToolTip();
  let url = ASCENSION_API.spell_tooltip + this.id + '/tooltip.html'
  $.ajax({
    url: url,
    success: (data) => {
      this.requestToolTipMetaData(data);
    }
  })
  // this.loadClickEvents();

}
Spell.prototype.toggleIconFilter = function (setting) {
  if (setting == 'on') {
    $(this.element).find('img').css('filter', 'grayscale(100)')

  }
  else if (setting == 'off') {
    $(this.element).find('img').css('filter', 'none')

  }

}
Spell.prototype.loadSavedIcons = function () {
  savedIcons.forEach((icon) => {
    if (icon.index == this.index
      && icon.class_name == this.class_name
      && (icon instanceof Talent) === (this instanceof Talent) &&
      icon.spec_name == this.spec_name)  //Check if they are both instances of talent, if not then they are abilities
    {
      this.curRank = icon.curRank;
      try {
        this.updateRankBox();
      }
      catch (err) {
      }
      this.toggleIconFilter('off')
    }
  })
}
Spell.prototype.saveIcon = function (operation) {
  if (operation == 'add') {
    savedIcons.add(this)

  }
  if (operation == 'remove') {
    savedIcons.delete(this)
    let newIcon = this
    if (this instanceof Talent && this.curRank > 0) {
      newIcon.updateState()
      savedIcons.add(this)
    }

  }


}
//Ability Blue Print
function Ability(id, element, image, i, class_name, spec_name) {
  this.id = id
  this.image = image
  this.element = element;
  this.index = i
  this.class_name = class_name;
  this.spec_name = spec_name;

  this.createImageElement();

  this.tooltipActivator
  this.toolTipContent
  this.locked = false;

  this.curRank = 0;
  this.nRanks = 1;

  this.initToolTip()
  /*Prevent dev tool inspect on right click*/
  element.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
  this.loadClickEvents = () => {
    /*Handle left click and right click for desktop*/
    element.onmousedown = (event) => {
      if (event.which == 1 && this.locked == false && this.curRank == 0) {
        /* Add point on left click and remove gray filter*/
        this.toggleIconFilter('off')
        resourceCounter.updateCounter(this.toolTipContent)
        this.curRank = 1;
        this.saveIcon('add')

      }
      if (event.which == 3 && this.curRank == 1) {
        /* Remove point on right click*/
        resourceCounter.updateCounter(this.toolTipContent, 'remove')
        this.toggleIconFilter('on')
        this.curRank = 0;
        this.saveIcon('remove')
      }
    }
  }
  this.loadClickEvents();
  this.loadSavedIcons();

}
Ability.prototype = Object.create(Spell.prototype)

//Talent Blue Print
function Talent(id, element, nRanks, image, i, class_name, spec_name) {
  this.id = id;
  this.image = image;
  this.element = element;
  this.index = i
  this.class_name = class_name;
  this.spec_name = spec_name;


  this.createImageElement();

  //add toltip
  this.tooltipActivator
  this.toolTipContent;
  this.locked = false;

  this.initToolTip()

  this.nRanks = nRanks;
  this.curRank = 0;
  // Add Rank Box
  $(this.element).append("<div class=rankBox>" + this.curRank + " / " + this.nRanks + "</div>")


  this.states = [] // Holds array of ids for each rank
  this.updateState = () => {
    let index = this.curRank
    if (index > 0) {
      index -= 1
    }
    else (
      index = 0
    )
    this.id = this.states[index].id
  }

  this.updateRankBox = () => {
    $(this.element).find('.rankBox').html("<div class=rankBox>" + this.curRank + " / " + this.nRanks + "</div>")
  }

  /*Prevent dev tool inspect on right click*/
  element.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  this.loadClickEvents = () => {
    /*Handle left click and right click for desktop*/
    element.onmousedown = (event) => {
      if (event.which == 1 && this.locked == false) {
        /* Add point on left click and remove gray filter*/
        this.toggleIconFilter('off')
        if (this.curRank < this.nRanks) {
          this.curRank += 1;
          this.updateState()
          this.updateToolTip()
          resourceCounter.updateCounter(this.toolTipContent)
          this.updateRankBox()

          this.saveIcon('add')
        }

      }
      if (event.which == 3) {
        /* Remove point on right click*/
        if (this.curRank > 0) {
          this.curRank -= 1;
          this.updateState()
          this.updateToolTip()
          resourceCounter.updateCounter(this.toolTipContent, 'remove')

          this.updateRankBox()
          this.saveIcon('remove')
          /* If rank == 0, add greyscale filter */
          if (this.curRank == 0) {
            this.toggleIconFilter('on')
          }

        }
      }
    }
  }
  this.loadClickEvents();

  this.loadSavedIcons();


}
Talent.prototype = Object.create(Ability.prototype);

function Header() {
  this.initDesktop = function () {
    createDesktopElements('header')
  }
  this.initMobile = function () {
    createMobileElements('header')
  }
  const createDesktopElements = (parent) => {
    $(parent).empty();
    $(parent).append('<div class="resourceCounter"></div>')
    $(parent).append('<div class="class-icon-container"></div>')

    showTree('abilities')
    this.loadIcons($(parent + ' .class-icon-container'))

  }
  const createMobileElements = (parent) => {
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
      /*Close modal after selecting a new class*/
      SELECTED.update(name)
    }
  }
}

function Footer() {
  let self;
  this.initDesktop = function () {
    createElements('header > .resourceCounter')
    removeElements('footer')
  }
  this.initMobile = function () {
    createElements('footer')
    removeElements('header > .resourceCounter')
  }

  const appendImage = (target, icon) => {
    let img = document.createElement("img")
    img.src = icon
    $(self).find(target).append(img)
  }
  function createElements(parent) {
    $(parent).empty();
    self = parent
    $(parent).append(
      '<div> ' +
      '<div id="abilityPointsCounter">' +
      'AP Remaining: ' +
      (resourceCounter.abilityPointsRequired.max - resourceCounter.abilityPointsRequired.current) +
      '</div> ' +
      '<div id="talentPointsCounter">' +
      'TP Remaining: ' +
      (resourceCounter.talentPointsRequired.max - resourceCounter.talentPointsRequired.current) +
      '</div> </div>')
    appendImage('#talentPointsCounter', ASCENSION_API.talentEssenceIcon)
    appendImage('#abilityPointsCounter', ASCENSION_API.abilityEssenceIcon)

    $(parent).append('<div class="reset"> Reset All</div>')

    $(parent).append('<div id ="levelCounter">' +
      'Level Required: '
      + resourceCounter.levelRequired.current
      + '</div>')

    $(parent).find('.reset').on('click', () => {
      let event = new Event('resetAll')
      document.dispatchEvent(event)
    })
  }
  function removeElements(parent) {
    $(parent).empty();
  }

  document.addEventListener('CounterChanged', (e) => {
    $('#abilityPointsCounter').text('AP Remaining: ' + (e.A.max - e.A.current))
    appendImage('#abilityPointsCounter', ASCENSION_API.abilityEssenceIcon)

    $('#talentPointsCounter').text('TP Remaining: ' + (e.T.max - e.T.current))
    appendImage('#talentPointsCounter', ASCENSION_API.talentEssenceIcon)
    $('#levelCounter').text('Level Required: ' + e.L.current)
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

  var isMobile = {
    Windows: function () {
      return /IEMobile/i.test(navigator.userAgent);
    },
    Android: function () {
      return /Android/i.test(navigator.userAgent);
    },
    BlackBerry: function () {
      return /BlackBerry/i.test(navigator.userAgent);
    },
    iOS: function () {
      return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },
    any: function () {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
  };

  //Modify viewport on android devices
  if (isMobile.Android()) {
    $('.wrapper').css('height', '92vh')
    $('.panel').css('height', 'calc(92vh - (var(--footer-height)))')
  }


  dispatchMapContent();
  FOOTER = new Footer();
  HEADER = new Header();
  MODAL = new Modal();
  MODAL.loadIcons($('.modal-content')); //Load Modal Icons

  function initDesktopLayout() {
    HEADER.initDesktop()
    FOOTER.initDesktop()
    MODAL.hide()
  }
  function initMobileLayout() {
    HEADER.initMobile()
    FOOTER.initMobile()
  }

  function initTabletLayout() {
    HEADER.initDesktop()
    FOOTER.initMobile()
    MODAL.hide();
  }

  document.addEventListener('classChanged', function () {
    MODAL.hide();
    dispatchMapContent();
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
      abilityTree.loadBackground()
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


  var states = [
    window.matchMedia("(min-width: 1224px)"),
    window.matchMedia("(min-width: 768px) and (max-width: 1223px)"),
    window.matchMedia("(max-width:767px)")
  ]

  function isDesktop() {
    let state = states[0]
    return state.matches
  }
  function isTablet() {
    let state = states[1]
    return state.matches
  }

  function setState() {
    if (isDesktop()) {
      initDesktopLayout()
    }
    else if (isTablet()) {
      initTabletLayout()
    }
    else {
      initMobileLayout()
    }
  }

  setState()
  states.forEach(state => {
    state.addListener(setState)
  });




}



