(cd {{gruntfileDirectory}} && {{command}}{{#if task}} {{task}}{{/if}}{{#if args}} {{args}}{{/if}} && git add client/index.html && git commit -a -m "Versioning frontend")
