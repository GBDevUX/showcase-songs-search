import jQuery from 'jquery';

window.$ = jQuery; // workaround for https://github.com/parcel-bundler/parcel/issues/333

import 'popper.js';
import 'bootstrap';

import instantsearch from 'instantsearch.js/es';
import {
  searchBox,
  infiniteHits,
  configure,
  stats,
  analytics,
  refinementList,
  numericMenu,
  sortBy,
} from 'instantsearch.js/es/widgets';
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
import images from '../images/*.*';

function iconForUrlObject(urlObject) {
  if (urlObject['type'] === 'amazon asin') {
    return images['amazon_icon']['svg'];
  } else if (urlObject['url'].includes('spotify.com')) {
    return images['spotify_icon']['svg'];
  } else {
    return images['generic_song_link_icon']['svg'];
  }
}

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: 'xyz', // Be sure to use an API key that only allows searches, in production
    nodes: [
      {
        host: 'localhost',
        port: '8108',
        protocol: 'http',
      },
    ],
  },
  // The following parameters are directly passed to Typesense's search API endpoint.
  //  So you can pass any parameters supported by the search endpoint below.
  //  queryBy is required.
  additionalSearchParameters: {
    queryBy: 'title,album_name',
    highlightAffixNumTokens: 50,
  },
});
const searchClient = typesenseInstantsearchAdapter.searchClient;
const indexName = 's';
const search = instantsearch({
  searchClient,
  indexName: indexName,
  routing: true,
});

search.addWidgets([
  searchBox({
    container: '#searchbox',
    showSubmit: false,
    showReset: false,
    placeholder: 'Search for a song or album title',
    autofocus: true,
    cssClasses: {
      input: 'form-control',
    },
  }),

  // analytics({
  //   pushFunction(formattedParameters, state, results) {
  //     window.ga('set', 'page', (window.location.pathname + window.location.search).toLowerCase());
  //     window.ga('send', 'pageView');
  //   },
  // }),

  stats({
    container: '#stats',
  }),
  infiniteHits({
    container: '#hits',
    cssClasses: {
      list: 'list-unstyled grid-container',
      item: 'd-flex flex-column search-result-card bg-light-2 p-4 pt-5 p-md-3',
      loadMore: 'btn btn-primary',
    },
    templates: {
      item: `
            <h6 class="text-primary font-weight-light font-letter-spacing-loose mb-0">
              {{#helpers.snippet}}{ "attribute": "title" }{{/helpers.snippet}}
            </h6>
            <div>
              by {{#helpers.snippet}}{ "attribute": "primary_artist_name" }{{/helpers.snippet}}
            </div>
            <div class="mt-3">
              from {{#helpers.snippet}}{ "attribute": "album_name" }{{/helpers.snippet}}
            </div>
            <div class="text-muted small mb-3">
              Released {{ release_date_display }}
            </div>

            <div class="mt-auto text-right">
              {{#urls}}
              <a href="{{ url }}" target="_blank" class="ml-1"><img src="{{ icon }}" alt="{{ type }}" height="14"></a>
              {{/urls}}
            </div>
        `,
      empty: 'No songs found for <q>{{ query }}</q>. Try another search term.',
    },
    transformItems: items => {
      return items.map(item => {
        return {
          ...item,
          release_date_display: (() => {
            const parsedDate = new Date(item.release_date);
            return `${parsedDate.getUTCFullYear()}/${(
              '0' +
              parsedDate.getUTCMonth() +
              1
            ).slice(-2)}`;
          })(),
          urls: item.urls.map(urlObj => {
            return {
              icon: iconForUrlObject(urlObj),
              ...urlObj,
            };
          }),
        };
      });
    },
  }),
  refinementList({
    container: '#genres-refinement-list',
    attribute: 'genres',
    searchable: true,
    searchablePlaceholder: 'Search genres',
    showMore: true,
    cssClasses: {
      searchableInput: 'form-control form-control-sm mb-2 border-light-2',
      searchableSubmit: 'd-none',
      searchableReset: 'd-none',
      showMore: 'btn btn-secondary btn-sm align-content-center',
      list: 'list-unstyled',
      count: 'badge badge-light bg-light-2 ml-2',
      label: 'd-flex align-items-center',
      checkbox: 'mr-2',
    },
  }),
  refinementList({
    container: '#artists-refinement-list',
    attribute: 'primary_artist_name',
    searchable: true,
    searchablePlaceholder: 'Search artists',
    showMore: true,
    cssClasses: {
      searchableInput: 'form-control form-control-sm mb-2 border-light-2',
      searchableSubmit: 'd-none',
      searchableReset: 'd-none',
      showMore: 'btn btn-secondary btn-sm',
      list: 'list-unstyled',
      count: 'badge badge-light bg-light-2 ml-2',
      label: 'd-flex align-items-center',
      checkbox: 'mr-2',
    },
  }),
  refinementList({
    container: '#release-type-refinement-list',
    attribute: 'release_group_types',
    searchable: true,
    searchablePlaceholder: 'Search release types',
    showMore: true,
    cssClasses: {
      searchableInput: 'form-control form-control-sm mb-2 border-light-2',
      searchableSubmit: 'd-none',
      searchableReset: 'd-none',
      showMore: 'btn btn-secondary btn-sm',
      list: 'list-unstyled',
      count: 'badge badge-light bg-light-2 ml-2',
      label: 'd-flex align-items-center',
      checkbox: 'mr-2',
    },
  }),
  refinementList({
    container: '#countries-refinement-list',
    attribute: 'country',
    searchable: true,
    searchablePlaceholder: 'Search countries',
    showMore: true,
    cssClasses: {
      searchableInput: 'form-control form-control-sm mb-2 border-light-2',
      searchableSubmit: 'd-none',
      searchableReset: 'd-none',
      showMore: 'btn btn-secondary btn-sm',
      list: 'list-unstyled',
      count: 'badge badge-light bg-light-2 ml-2',
      label: 'd-flex align-items-center',
      checkbox: 'mr-2',
    },
  }),
  numericMenu({
    container: '#release-date-selector',
    attribute: 'release_date',
    items: [
      { label: 'All' },
      { label: '1970s', end: 315532799000 },
      { label: '1980s', start: 315532799001, end: 631151999000 },
      { label: '1990s', start: 631151999001, end: 946684799000 },
      { label: '2000s', start: 946684799001, end: 1262303999000 },
      { label: '2010s', start: 1262303999001, end: 1577836799000 },
      { label: '2020s', start: 1577836799001 },
    ],
    cssClasses: {
      list: 'list-unstyled',
      radio: 'mr-1',
    },
  }),
  configure({
    hitsPerPage: 15,
  }),
  sortBy({
    container: '#sort-by',
    items: [
      { label: 'Recent first', value: `${indexName}` },
      { label: 'Oldest first', value: `${indexName}/sort/release_date:asc` },
    ],
    cssClasses: {
      select: 'custom-select custom-select-sm',
    },
  }),
]);

search.start();

$(function() {
  // Set initial topic, if empty
  // if (
  //   $('input[type=search]')
  //     .val()
  //     .trim() === ''
  // ) {
  //   $('input[type=search]').val('Billy');
  //   search.helper.setQuery($('input[type=search]').val()).search();
  // }

  // Handle example search terms
  $('#example-search-terms a').on('click', event => {
    $('input[type=search]').val(event.target.textContent);
    search.helper.setQuery($('input[type=search]').val()).search();

    if (!matchMedia('(min-width: 768px)').matches) {
      setTimeout(() => {
        $('html, body').animate(
          {
            scrollTop: $('#best-experienced-warning').offset().top,
          },
          500
        );
      }, 1000);
    }
  });
});
