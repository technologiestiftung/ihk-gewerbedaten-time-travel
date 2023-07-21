# IHK Gewerbedaten Time Travel

Small data visualization that allows time travelling through the Berlin business landscape of the past 100 years.

> This project uses the [latest open dataset](https://github.com/IHKBerlin/IHKBerlin_Gewerbedaten) provided by IHK Berlin.

## Getting started

This project is vanilla HTML, CSS and JavaScript. We merely use [Maplibre GL JS](https://maplibre.org/projects/maplibre-gl-js/) for the map view and [Stimulus](https://stimulus.hotwired.dev/) for organizing JavaScript and making it reactive to DOM interactions.

For developement, simply start a local dev server, e.g. via:

```bash
npx live-server
```

You will now have a live-reloading server available at http://localhost:8080. Please substitute `localhost` with your local IP address and make sure it is included in the allowed origins for the businesses vector tileset in Maptiler.

Now you can start developing at http://xxx.xxx.xxx.xxx:8080.

### Adding JavaScript

If you want to add new JavaScript, take a look at the [Stimulus conventions](https://stimulus.hotwired.dev/handbook/introduction) and if you decide to add a new controller, add it in `./js/controllers/` and register it in `./js/stimulus-controllers.js`.

## Preparing the data

### PMTiles for vector tiles

We create a PMTiles tile archive that we host on Amazon S3. In order to upload the required `.pmtiles` format, we need to generate it using [Tippecanoe](https://github.com/felt/tippecanoe).

> Note that you will need to install the **latest** version of [Tippecanoe](https://github.com/felt/tippecanoe) first if you don't have it.

Create a directory for temporary files if you haven't yet (this is gitignored):

```bash
mkdir tmp
```

Download the latest IHK dataset as a CSV:

```bash
curl -s -L https://media.githubusercontent.com/media/IHKBerlin/IHKBerlin_Gewerbedaten/master/data/IHKBerlin_Gewerbedaten.csv -o tmp/data.csv
```

Add headers for filtered CSV:

```bash
awk 'NR==1{print $1}' tmp/data.csv > tmp/data-filtered.csv
```

Only keep the businesses that are registered in the Handelsregister:

```bash
grep -e 'im Handelsregister eingetragen' tmp/data.csv >> tmp/data-filtered.csv
```

Feed the CSV into Tippecanoe, using some flags to ensure we display _all_ business as dots and only include the properties necessary for the vector tileset:

```bash
tippecanoe -f -o tiles/data.pmtiles -b0 -r1 -pk -pf -y branch_top_level_desc -y business_age -l ihk ./tmp/data-filtered.csv
```

Now you can upload the tileset `tiles/data.pmtiles` to the S3 bucket, making sure that [correct permissions](https://protomaps.com/docs/pmtiles/cloud-storage#amazon-s3) are set.

> TODO: This could become a bash script to make it less manual work.

## Todo

- [x] use better (more subtle) basemap for dataviz purposes (e.g. via Maptiler and restricting the Maptiler key to specific origins)
- [x] fix bug where slecting a branch seems to ignore the current year slider value
- [x] only show im Handelsregister eingetragen
- [ ] style year slider properly
- [ ] style select menu
- [ ] agree on focus branches
- [ ] consider adding legend
- [ ] find better colors
