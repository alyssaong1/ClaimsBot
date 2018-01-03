var data = {}

data.countrycodes = {
  "Singapore": "65",
  "United States": "1",
  "Germany": "49"
}

data.LOBchoices = {
  "Aviation": {
    code: "A",
    examples: ""
  },
  "Engineering": {
    code: "E",
    examples: ""
  },
  "Energy": {
    code: "N",
    examples: ""
  },
  "Financial Lines": {
    code: "F",
    examples: ""
  },
  "Liability": {
    code: "L",
    examples: ""
  },
  "Marine": {
    code: "M",
    examples: ""
  },
  "Property": {
    code: "P",
    examples: "House, Building, Roof top, walls"
  }
}

data.countrychoices = {
  "Singapore": {
    code: "SG"
  },
  "Hong Kong": {
    code: "HK"
  },
  "Japan": {
    code: "JP"
  }
}

data.countries = [
  {
    "code": "SG",
    "name": "singapore"
  },
  {
    "code": "JP",
    "name": "japan"
  },
  {
    "code": "HK",
    "name": "hong kong"
  }
]

data.lob = [
{
    code: "A",
    name: "Aviation",
    examples: ""
  },
   {
    code: "E",
    name: "Engineering",
    examples: ""
  },
   {
    code: "N",
    name: "Energy",
    examples: ""
  },
   {
    code: "F",
    name: "Financial Lines",
    examples: ""
  },
  {
    "code": "L",
    "name": "Liability",
    "examples": ""
  },
  {
    "code": "M",
    "name": "Marine",
    "examples": ""
  },
  {
    "code": "P",
    "name": "Property",
    "examples": "House, Building, Roof top, walls"
  }
]


data.contacts = [
  // Insert your contacts here
  {
    "wipkey": "SingaporeMarine",
    "policycode": "",
    "country": "Singapore",
    "lob": "Marine",
    "name": "",
    "email": "",
    "phone": 65123456
  }
]

data.claims = [
  // dummy claims used for now
  {
    "claimcode": "",
    "keycode": 123,
    "status": "Submited"
  },
  {
    "claimcode": "",
    "keycode": 124,
    "status": "Pending"
  },
  {
    "claimcode": "",
    "keycode": 125,
    "status": "Rejected"
  },
  {
    "claimcode": "",
    "keycode": 126,
    "status": "Approved"
  },
  {
    "claimcode": "SGA127",
    "keycode": 127,
    "status": "Submited"
  },
  {
    "claimcode": "",
    "keycode": 128,
    "status": "Pending"
  },
  {
    "claimcode": "",
    "keycode": 129,
    "status": "Approved"
  },
  {
    "claimcode": "",
    "keycode": 123,
    "status": "Submited"
  },
  {
    "claimcode": "",
    "keycode": 124,
    "status": "Pending"
  },
  {
    "claimcode": "",
    "keycode": 125,
    "status": "Approved"
  },
  {
    "claimcode": "",
    "keycode": 126,
    "status": "Submited"
  },
  {
    "claimcode": "",
    "keycode": 127,
    "status": "Pending"
  },
  {
    "claimcode": "",
    "keycode": 128,
    "status": "Approved"
  },
  {
    "claimcode": "",
    "keycode": 123,
    "status": "Submited"
  },
  {
    "claimcode": "",
    "keycode": 124,
    "status": "Pending"
  },
  {
    "claimcode": "",
    "keycode": 125,
    "status": "Approved"
  },
  {
    "claimcode": "",
    "keycode": 126,
    "status": "Submited"
  },
  {
    "claimcode": "",
    "keycode": 127,
    "status": "Pending"
  },
  {
    "claimcode": "",
    "keycode": 128,
    "status": "Approved"
  }
]

module.exports = data;