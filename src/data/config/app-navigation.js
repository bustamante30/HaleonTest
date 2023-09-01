const nav = (emit, isExternalAdmin) => {
  return [
    {
      label: 'Manage Users',
      to: isExternalAdmin === 'PrinterAdmin' ? '/users' : '/users?role=super'
    },
    {
      label: 'Help',
      items: [
        {
          label: 'Report an Issue',
          command: () => { emit('report') }
        },
        {
          label: 'Watch Demo',
          command: () => { emit('demo') }
        },
        {
          label: 'FAQs',
          to: '/faq'
        }
      ]
    }
  ]
}

export default nav