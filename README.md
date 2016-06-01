# Flexbot
Updates flex mls prices based on lechuga verde and centrifuga.

* Front-end: react + mobx.

* Backend: [FeathersJS](http://feathersjs.com).
  * Website Automation with [nightmare-plus](https://github.com/rickmed/nightmare-plus) on backend.

* Infrastructure
  * Docker (most likely AWS multicontainer EBS)
  * DB: AWS DynamoDB (using feathersjs' levelUp adapter)
