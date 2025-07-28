export default {
  RoutesApp: {
    screens: {
      RoutesCheckList: {
        screens: {
          // CheckListShow: 'checklist/:id'
          CheckListShow: `factory/:factoryId/checklist-content/:checklistId`
        }
      }
    }
  }
}