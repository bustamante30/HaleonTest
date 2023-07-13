const config = {
  fields: [
    { label: 'Job #', name: 'order.jobNumber' },
    { label: 'Customer', name: 'order.endUserRef' },

    { label: 'Primary Site Location', name: 'contact.primarySiteLocation' },
    { label: 'Primary Project Manager', name: 'contact.primaryProjectManager' },
    { label: 'Primary End User', name: 'contact.primaryEndUser' },

    { label: 'Print Process', name: 'techSpec.printProcess' },
    { label: 'Description', name: 'techSpec.description' },
    { label: 'Customer 1 Up Die', name: 'techSpec.custOneUpDie' },
    { label: '# Across Cylinder', name: 'techSpec.acrossCylinder' },
    { label: '# Around Cylinder', name: 'techSpec.aroundCylinder' },
    { label: 'Cylinder Size', name: 'techSpec.cylinderSize' },
    { label: 'Surface / Reverse', name: 'techSpec.surfaceReverse' },
    { label: 'Substrate', name: 'techSpec.substrate' },
    { label: 'Dispro %', name: 'techSpec.disproPercent' },

    { label: 'Colours Count', name: 'colour.count' },

    { label: 'Barcode Number', name: 'barcode.number' },
    { label: 'Mag %', name: 'barcode.magPercent' },
    { label: 'BWR', name: 'barcode.bwr' },
    { label: 'NBW', name: 'barcode.nbw' },
  ]
}

export { config }
