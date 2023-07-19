# IHK Gewerbedaten Time Travel

Small data visualization that allows time travelling through the Berlin business landscape of the past 100 years.

> This project uses the [latest open dataset](https://github.com/IHKBerlin/IHKBerlin_Gewerbedaten) provided by IHK Berlin.

## Getting started

This project is vanilla HTML, CSS and JavaScript. We merely use [Maplibre GL JS](https://maplibre.org/projects/maplibre-gl-js/) for the map view and [Stimulus](https://stimulus.hotwired.dev/) for organizing JavaScript and making it reactive to DOM interactions.

For developement, simply start a local dev server, e.g. via:

```bash
npx live-server
```

You will now have a live-reloading server available at http://localhost:8080.

### Adding JavaScript

If you want to add new JavaScript, take a look at the [Stimulus conventions](https://stimulus.hotwired.dev/handbook/introduction) and if you decide to add a new controller, add it in `./js/controllers/` and register it in `./js/stimulus-controllers.js`.

## PMTiles tileset

We use [PMTiles](https://github.com/protomaps/PMTiles) in order to serve the dataset in the most performant way. See below the instructions for updating the tileset, should it become necessary.

> Note that you will need to install [Tippecanoe](https://github.com/felt/tippecanoe) first if you haven't yet.

```bash
mkdir tmp
```

```bash
curl -s -L https://media.githubusercontent.com/media/IHKBerlin/IHKBerlin_Gewerbedaten/master/data/IHKBerlin_Gewerbedaten.csv -o tmp/data.csv
```

```bash
tippecanoe -f -o tiles/data.pmtiles -b0 -r1 -pk -pf -y branch_top_level_desc -y business_age -l ihk ./tmp/data.csv
```

```bash
rm ./tmp/data.csv
```

> Note that we do commit this file to GitHub because it is rather small (~18MB). However, we could improve this by requiring the file from a storage solution like S3.

> TODO: This could become a bash script to make it less manual work.

## Todo

- [ ] use better (more subtle) basemap for dataviz purposes (e.g. via Maptiler and restricting the Maptiler key to specific origins)
- [ ] style year slider properly
- [ ] style select menu
- [ ] agree on focus branches