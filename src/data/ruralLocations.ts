export interface RuralCommune {
  name: string;
  department: string;
  departmentCode: string;
  postalCode: string;
  lat: number;
  lng: number;
  terroirNote?: string;
}

export interface RuralRegion {
  name: string;
  label: string;
  communes: RuralCommune[];
}

export const RURAL_REGIONS: RuralRegion[] = [
  {
    name: 'Occitanie',
    label: 'Occitanie (Cévennes, Causses & Terroirs)',
    communes: [
      {
        name: 'Saint-Germain-de-Calberte',
        department: 'Lozère (48)',
        departmentCode: '48',
        postalCode: '48370',
        lat: 44.218,
        lng: 3.809,
        terroirNote: 'Vallée française, châtaigneraies et schiste'
      },
      {
        name: 'Florac-Trois-Rivières',
        department: 'Lozère (48)',
        departmentCode: '48',
        postalCode: '48400',
        lat: 44.323,
        lng: 3.593,
        terroirNote: 'Siège du Parc National des Cévennes'
      },
      {
        name: 'Sainte-Énimie',
        department: 'Lozère (48)',
        departmentCode: '48',
        postalCode: '48210',
        lat: 44.366,
        lng: 3.411,
        terroirNote: 'Gorges du Tarn & falaises calcaires'
      },
      {
        name: 'Meyrueis',
        department: 'Lozère (48)',
        departmentCode: '48',
        postalCode: '48150',
        lat: 44.179,
        lng: 3.429,
        terroirNote: 'Gorges de la Jonte & Causse Méjean'
      },
      {
        name: 'Le Pont-de-Montvert',
        department: 'Lozère (48)',
        departmentCode: '48',
        postalCode: '48220',
        lat: 44.363,
        lng: 3.743,
        terroirNote: 'Haut Tarn & granite du Mont Lozère'
      },
      {
        name: 'Saint-André-de-Valborgne',
        department: 'Gard (30)',
        departmentCode: '30',
        postalCode: '30940',
        lat: 44.156,
        lng: 3.683,
        terroirNote: 'Vallée Borgne & sériciculture cévenole'
      },
      {
        name: 'Saint-Jean-du-Gard',
        department: 'Gard (30)',
        departmentCode: '30',
        postalCode: '30270',
        lat: 44.105,
        lng: 3.884,
        terroirNote: 'Porte d’entrée des Cévennes'
      },
      {
        name: 'Peyre en Aubrac',
        department: 'Lozère (48)',
        departmentCode: '48',
        postalCode: '48130',
        lat: 44.721,
        lng: 3.284,
        terroirNote: 'Plateau basaltique de l’Aubrac'
      },
      {
        name: 'Villefort',
        department: 'Lozère (48)',
        departmentCode: '48',
        postalCode: '48800',
        lat: 44.438,
        lng: 3.932,
        terroirNote: 'Lac de retenue & contreforts du Mont Lozère'
      },
      {
        name: 'Conques-en-Rouergue',
        department: 'Aveyron (12)',
        departmentCode: '12',
        postalCode: '12320',
        lat: 44.600,
        lng: 2.396,
        terroirNote: 'Étape majeure du chemin de Compostelle'
      },
      {
        name: 'Najac',
        department: 'Aveyron (12)',
        departmentCode: '12',
        postalCode: '12270',
        lat: 44.220,
        lng: 1.979,
        terroirNote: 'Gorges de l’Aveyron & forteresse médiévale'
      },
      {
        name: 'Saint-Cirq-Lapopie',
        department: 'Lot (46)',
        departmentCode: '46',
        postalCode: '46330',
        lat: 44.464,
        lng: 1.670,
        terroirNote: 'Falaise au-dessus du Lot, Causses du Quercy'
      },
      {
        name: 'Saint-Antonin-Noble-Val',
        department: 'Tarn-et-Garonne (82)',
        departmentCode: '82',
        postalCode: '82140',
        lat: 44.152,
        lng: 1.756,
        terroirNote: 'Canyon de l’Aveyron et artisanat d’art'
      },
      {
        name: 'La Couvertoirade',
        department: 'Aveyron (12)',
        departmentCode: '12',
        postalCode: '12230',
        lat: 43.913,
        lng: 3.317,
        terroirNote: 'Cité templière du Larzac'
      }
    ]
  },
  {
    name: 'Bourgogne-Franche-Comté',
    label: 'Bourgogne-Franche-Comté (Morvan, Jura & Terres d’eau)',
    communes: [
      {
        name: 'Saint-Brisson',
        department: 'Nièvre (58)',
        departmentCode: '58',
        postalCode: '58230',
        lat: 47.268,
        lng: 4.091,
        terroirNote: 'Maison du Parc Naturel Régional du Morvan'
      },
      {
        name: 'Château-Chinon',
        department: 'Nièvre (58)',
        departmentCode: '58',
        postalCode: '58120',
        lat: 47.065,
        lng: 3.933,
        terroirNote: 'Capitale du Morvan boisé'
      },
      {
        name: 'Quarré-les-Tombes',
        department: 'Yonne (89)',
        departmentCode: '89',
        postalCode: '89630',
        lat: 47.368,
        lng: 3.998,
        terroirNote: 'Forêts denses & roche de la Pérouse'
      },
      {
        name: 'Saulieu',
        department: 'Côte-d’Or (21)',
        departmentCode: '21',
        postalCode: '21210',
        lat: 47.279,
        lng: 4.228,
        terroirNote: 'Porte gastronomique du Morvan'
      },
      {
        name: 'Anost',
        department: 'Saône-et-Loire (71)',
        departmentCode: '71',
        postalCode: '71550',
        lat: 47.078,
        lng: 4.100,
        terroirNote: 'Haut-Folin & traditions de la galvache'
      },
      {
        name: 'Ouroux-en-Morvan',
        department: 'Nièvre (58)',
        departmentCode: '58',
        postalCode: '58230',
        lat: 47.186,
        lng: 3.945,
        terroirNote: 'Lacs & étangs sauvages'
      },
      {
        name: 'Lormes',
        department: 'Nièvre (58)',
        departmentCode: '58',
        postalCode: '58140',
        lat: 47.307,
        lng: 3.818,
        terroirNote: 'Gorges de Narvau & étang du Goulven'
      },
      {
        name: 'Dun-les-Places',
        department: 'Nièvre (58)',
        departmentCode: '58',
        postalCode: '58230',
        lat: 47.285,
        lng: 4.015,
        terroirNote: 'Plateau boisé et sentiers sauvages'
      },
      {
        name: 'Baume-les-Messieurs',
        department: 'Jura (39)',
        departmentCode: '39',
        postalCode: '39210',
        lat: 46.708,
        lng: 5.644,
        terroirNote: 'Reculée jurassienne & cascade des Tufs'
      },
      {
        name: 'Château-Chalon',
        department: 'Jura (39)',
        departmentCode: '39',
        postalCode: '39210',
        lat: 46.755,
        lng: 5.626,
        terroirNote: 'Berceau du Vin Jaune d’exception'
      },
      {
        name: 'Clairvaux-les-Lacs',
        department: 'Jura (39)',
        departmentCode: '39',
        postalCode: '39130',
        lat: 46.577,
        lng: 5.748,
        terroirNote: 'Région des Lacs du Jura'
      },
      {
        name: 'Flavigny-sur-Ozerain',
        department: 'Côte-d’Or (21)',
        departmentCode: '21',
        postalCode: '21150',
        lat: 47.512,
        lng: 4.531,
        terroirNote: 'Cité médiévale & fabrique d’anis'
      }
    ]
  },
  {
    name: "Provence-Alpes-Côte d'Azur",
    label: "Provence-Alpes-Côte d'Azur (Luberon, Verdon & Haute-Provence)",
    communes: [
      {
        name: 'Buoux',
        department: 'Vaucluse (84)',
        departmentCode: '84',
        postalCode: '84480',
        lat: 43.832,
        lng: 5.385,
        terroirNote: 'Vallon de l’Aiguebrun & falaises d’escalade'
      },
      {
        name: 'Bonnieux',
        department: 'Vaucluse (84)',
        departmentCode: '84',
        postalCode: '84480',
        lat: 43.823,
        lng: 5.307,
        terroirNote: 'Forêt des Cèdres & versant nord du Luberon'
      },
      {
        name: 'Saignon',
        department: 'Vaucluse (84)',
        departmentCode: '84',
        postalCode: '84400',
        lat: 43.864,
        lng: 5.428,
        terroirNote: 'Rocher belvédère dominant le pays d’Apt'
      },
      {
        name: 'Roussillon',
        department: 'Vaucluse (84)',
        departmentCode: '84',
        postalCode: '84220',
        lat: 43.902,
        lng: 5.293,
        terroirNote: 'Falaises et sentier des ocres'
      },
      {
        name: 'Ménerbes',
        department: 'Vaucluse (84)',
        departmentCode: '84',
        postalCode: '84560',
        lat: 43.833,
        lng: 5.206,
        terroirNote: 'Vignobles AOC Luberon et carrières de pierre'
      },
      {
        name: 'Lourmarin',
        department: 'Vaucluse (84)',
        departmentCode: '84',
        postalCode: '84840',
        lat: 43.764,
        lng: 5.362,
        terroirNote: 'Versant sud du Luberon & oliveraies'
      },
      {
        name: 'Moustiers-Sainte-Marie',
        department: 'Alpes-de-Haute-Provence (04)',
        departmentCode: '04',
        postalCode: '04360',
        lat: 43.846,
        lng: 6.222,
        terroirNote: 'Porte des Gorges du Verdon & faïence'
      },
      {
        name: 'Castellane',
        department: 'Alpes-de-Haute-Provence (04)',
        departmentCode: '04',
        postalCode: '04120',
        lat: 43.847,
        lng: 6.513,
        terroirNote: 'Roc de Notre-Dame & eaux vives du Verdon'
      },
      {
        name: 'Simiane-la-Rotonde',
        department: 'Alpes-de-Haute-Provence (04)',
        departmentCode: '04',
        postalCode: '04150',
        lat: 43.980,
        lng: 5.562,
        terroirNote: 'Plateau d’Albion & lavande vraie'
      },
      {
        name: 'Colmars-les-Alpes',
        department: 'Alpes-de-Haute-Provence (04)',
        departmentCode: '04',
        postalCode: '04370',
        lat: 44.181,
        lng: 6.626,
        terroirNote: 'Haut-Verdon & Parc National du Mercantour'
      },
      {
        name: 'Saint-Martin-Vésubie',
        department: 'Alpes-Maritimes (06)',
        departmentCode: '06',
        postalCode: '06450',
        lat: 44.068,
        lng: 7.256,
        terroirNote: 'Suisse niçoise & vallon du Boréon'
      },
      {
        name: 'Cotignac',
        department: 'Var (83)',
        departmentCode: '83',
        postalCode: '83570',
        lat: 43.528,
        lng: 6.149,
        terroirNote: 'Falaise de tuf, habitat troglodytique & vignobles'
      }
    ]
  },
  {
    name: 'Nouvelle-Aquitaine',
    label: 'Nouvelle-Aquitaine (Pays Basque, Périgord & Pyrénées)',
    communes: [
      {
        name: 'Saint-Étienne-de-Baïgorry',
        department: 'Pyrénées-Atlantiques (64)',
        departmentCode: '64',
        postalCode: '64430',
        lat: 43.178,
        lng: -1.341,
        terroirNote: 'Vallée des Aldudes, élevage Kintoa & Irouléguy'
      },
      {
        name: 'Sare',
        department: 'Pyrénées-Atlantiques (64)',
        departmentCode: '64',
        postalCode: '64310',
        lat: 43.312,
        lng: -1.580,
        terroirNote: 'Au pied de La Rhune, pottoks & grottes'
      },
      {
        name: 'Saint-Jean-Pied-de-Port',
        department: 'Pyrénées-Atlantiques (64)',
        departmentCode: '64',
        postalCode: '64220',
        lat: 43.163,
        lng: -1.238,
        terroirNote: 'Cité fortifiée au pied des Pyrénées'
      },
      {
        name: 'Ainhoa',
        department: 'Pyrénées-Atlantiques (64)',
        departmentCode: '64',
        postalCode: '64250',
        lat: 43.306,
        lng: -1.498,
        terroirNote: 'Village-bastide labourdin aux façades rouges'
      },
      {
        name: 'Laruns',
        department: 'Pyrénées-Atlantiques (64)',
        departmentCode: '64',
        postalCode: '64440',
        lat: 42.987,
        lng: -0.426,
        terroirNote: 'Vallée d’Ossau, pic du Midi d’Ossau & pastoralisme'
      },
      {
        name: 'Saint-Léon-sur-Vézère',
        department: 'Dordogne (24)',
        departmentCode: '24',
        postalCode: '24290',
        lat: 45.011,
        lng: 1.090,
        terroirNote: 'Boucle de la Vézère au cœur du Périgord Noir'
      },
      {
        name: 'Beynac-et-Cazenac',
        department: 'Dordogne (24)',
        departmentCode: '24',
        postalCode: '24220',
        lat: 44.872,
        lng: 1.144,
        terroirNote: 'Falaise calcaire surplombant la Dordogne'
      },
      {
        name: 'Collonges-la-Rouge',
        department: 'Corrèze (19)',
        departmentCode: '19',
        postalCode: '19500',
        lat: 45.061,
        lng: 1.654,
        terroirNote: 'Bâti en grès pourpre dans les vergers de noyers'
      },
      {
        name: 'Turenne',
        department: 'Corrèze (19)',
        departmentCode: '19',
        postalCode: '19500',
        lat: 45.053,
        lng: 1.583,
        terroirNote: 'Ancienne vicomté perchée sur sa butte'
      },
      {
        name: 'Monflanquin',
        department: 'Lot-et-Garonne (47)',
        departmentCode: '47',
        postalCode: '47150',
        lat: 44.533,
        lng: 0.768,
        terroirNote: 'Bastide du Haut-Agenais & vergers de prunes'
      },
      {
        name: 'Felletin',
        department: 'Creuse (23)',
        departmentCode: '23',
        postalCode: '23500',
        lat: 45.884,
        lng: 2.174,
        terroirNote: 'Plateau de Millevaches & berceau de la tapisserie'
      }
    ]
  },
  {
    name: 'Auvergne-Rhône-Alpes',
    label: 'Auvergne-Rhône-Alpes (Drôme, Vercors, Cévennes & Volcans)',
    communes: [
      {
        name: 'Dieulefit',
        department: 'Drôme (26)',
        departmentCode: '26',
        postalCode: '26220',
        lat: 44.523,
        lng: 5.064,
        terroirNote: 'Pays potier, picodon AOP & lavande'
      },
      {
        name: 'Bourdeaux',
        department: 'Drôme (26)',
        departmentCode: '26',
        postalCode: '26460',
        lat: 44.586,
        lng: 5.134,
        terroirNote: 'Vallée du Roubion & crêtes de la forêt de Saoû'
      },
      {
        name: 'Saillans',
        department: 'Drôme (26)',
        departmentCode: '26',
        postalCode: '26340',
        lat: 44.697,
        lng: 5.197,
        terroirNote: 'Vallée de la Drôme sauvage & clairette de Die'
      },
      {
        name: 'La Chapelle-en-Vercors',
        department: 'Drôme (26)',
        departmentCode: '26',
        postalCode: '26420',
        lat: 44.968,
        lng: 5.416,
        terroirNote: 'Hauts plateaux du Vercors & forêts sauvages'
      },
      {
        name: 'Saint-Montan',
        department: 'Ardèche (07)',
        departmentCode: '07',
        postalCode: '07220',
        lat: 44.440,
        lng: 4.624,
        terroirNote: 'Cité médiévale en pierre calcaire d’Ardèche'
      },
      {
        name: 'Vogüé',
        department: 'Ardèche (07)',
        departmentCode: '07',
        postalCode: '07200',
        lat: 44.550,
        lng: 4.415,
        terroirNote: 'Amphithéâtre de falaises au bord de l’Ardèche'
      },
      {
        name: 'Thueyts',
        department: 'Ardèche (07)',
        departmentCode: '07',
        postalCode: '07330',
        lat: 44.676,
        lng: 4.221,
        terroirNote: 'Chaussée des Géants basaltique & Pont du Diable'
      },
      {
        name: 'Salers',
        department: 'Cantal (15)',
        departmentCode: '15',
        postalCode: '15140',
        lat: 45.138,
        lng: 2.493,
        terroirNote: 'Basalte noir au cœur des Monts du Cantal'
      },
      {
        name: 'Murol',
        department: 'Puy-de-Dôme (63)',
        departmentCode: '63',
        postalCode: '63790',
        lat: 45.575,
        lng: 2.943,
        terroirNote: 'Forteresse médiévale & lac Chambon'
      },
      {
        name: 'Besse-et-Saint-Anastaise',
        department: 'Puy-de-Dôme (63)',
        departmentCode: '63',
        postalCode: '63610',
        lat: 45.512,
        lng: 2.933,
        terroirNote: 'Pavés en pierre de lave & saint-nectaire fermier'
      },
      {
        name: 'La Chaise-Dieu',
        department: 'Haute-Loire (43)',
        departmentCode: '43',
        postalCode: '43160',
        lat: 45.321,
        lng: 3.696,
        terroirNote: 'Hauts plateaux granitiques du Livradois'
      },
      {
        name: 'Sixt-Fer-à-Cheval',
        department: 'Haute-Savoie (74)',
        departmentCode: '74',
        postalCode: '74740',
        lat: 46.056,
        lng: 6.777,
        terroirNote: 'Cirque naturel alpin & réserve naturelle'
      }
    ]
  },
  {
    name: 'Bretagne',
    label: 'Bretagne (Monts d’Arrée & Terroirs intérieurs)',
    communes: [
      {
        name: 'Huelgoat',
        department: 'Finistère (29)',
        departmentCode: '29',
        postalCode: '29690',
        lat: 48.363,
        lng: -3.745,
        terroirNote: 'Chaos granitique & forêt légendaire'
      },
      {
        name: 'Locronan',
        department: 'Finistère (29)',
        departmentCode: '29',
        postalCode: '29180',
        lat: 48.098,
        lng: -4.208,
        terroirNote: 'Cité des tisserands en granit breton'
      },
      {
        name: 'Rochefort-en-Terre',
        department: 'Morbihan (56)',
        departmentCode: '56',
        postalCode: '56220',
        lat: 47.699,
        lng: -2.336,
        terroirNote: 'Schiste ardoisier, fleurs & artisans d’art'
      },
      {
        name: 'Bécherel',
        department: 'Ille-et-Vilaine (35)',
        departmentCode: '35',
        postalCode: '35190',
        lat: 48.295,
        lng: -1.945,
        terroirNote: 'Cité du livre & collines d’Ille-et-Vilaine'
      },
      {
        name: 'Moncontour',
        department: 'Côtes-d’Armor (22)',
        departmentCode: '22',
        postalCode: '22510',
        lat: 48.361,
        lng: -2.632,
        terroirNote: 'Cité médiévale du pays de Saint-Brieuc'
      }
    ]
  },
  {
    name: 'Normandie',
    label: 'Normandie (Suisse Normande & Pays d’Auge)',
    communes: [
      {
        name: 'Clécy',
        department: 'Calvados (14)',
        departmentCode: '14',
        postalCode: '14570',
        lat: 48.917,
        lng: -0.483,
        terroirNote: 'Capitale de la Suisse Normande & méandres de l’Orne'
      },
      {
        name: 'Beuvron-en-Auge',
        department: 'Calvados (14)',
        departmentCode: '14',
        postalCode: '14430',
        lat: 49.189,
        lng: -0.046,
        terroirNote: 'Manoirs à pans de bois & route du cidre'
      },
      {
        name: 'Le Bec-Hellouin',
        department: 'Eure (27)',
        departmentCode: '27',
        postalCode: '27800',
        lat: 49.231,
        lng: 0.721,
        terroirNote: 'Vallée du Risle, abbaye & permaculture'
      },
      {
        name: 'Saint-Céneri-le-Gérei',
        department: 'Orne (61)',
        departmentCode: '61',
        postalCode: '61250',
        lat: 48.379,
        lng: -0.052,
        terroirNote: 'Alpes Mancelles & bord de Sarthe'
      }
    ]
  },
  {
    name: 'Grand Est',
    label: 'Grand Est (Massif des Vosges & Terroirs rhénans)',
    communes: [
      {
        name: 'Sainte-Croix-aux-Mines',
        department: 'Haut-Rhin (68)',
        departmentCode: '68',
        postalCode: '68660',
        lat: 48.261,
        lng: 7.227,
        terroirNote: 'Val d’Argent au cœur des Vosges'
      },
      {
        name: 'Kaysersberg Vignoble',
        department: 'Haut-Rhin (68)',
        departmentCode: '68',
        postalCode: '68240',
        lat: 48.139,
        lng: 7.262,
        terroirNote: 'Vallée de la Weiss & vignoble en terrasse'
      },
      {
        name: 'Saint-Quirin',
        department: 'Moselle (57)',
        departmentCode: '57',
        postalCode: '57560',
        lat: 48.608,
        lng: 7.064,
        terroirNote: 'Piémont vosgien et forêt du Donon'
      },
      {
        name: 'Hunawihr',
        department: 'Haut-Rhin (68)',
        departmentCode: '68',
        postalCode: '68150',
        lat: 48.179,
        lng: 7.311,
        terroirNote: 'Église fortifiée & vignoble d’Alsace'
      }
    ]
  }
];

export function getRuralRegionByName(name: string): RuralRegion | undefined {
  return RURAL_REGIONS.find(r => r.name.toLowerCase() === name.toLowerCase());
}

export function getCommunesForRegion(regionName: string): RuralCommune[] {
  const region = getRuralRegionByName(regionName);
  return region ? region.communes : [];
}

export function findRuralCommune(regionName: string, communeName: string): RuralCommune | undefined {
  const communes = getCommunesForRegion(regionName);
  return communes.find(c => c.name.toLowerCase() === communeName.toLowerCase());
}
