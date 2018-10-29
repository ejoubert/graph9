import Route from '@ember/routing/route';

export default Route.extend({

  model() {
    return [
      {
        title: "Cloud-based ",
        text: "",
      },
      {
        title: "No code knowledge required",
        text: "Creating and editing your nodes is as simple as a double click. No prior coding experience required to get started with your own graph."
      }
    ]
  }
});
