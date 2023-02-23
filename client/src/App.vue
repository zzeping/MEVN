<template>
  <v-app id="inspire" :style="{ 'background-image': 'url(' + require('./bg11.png') + ')' }">
    <v-navigation-drawer v-model="drawer" app>
      <v-list-item class="pa-3">
        <v-list-item-content>
          <v-img contain src="./assets/logo-no-background.png" height="25px" />
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-item-group color="primary">
          <v-list-item v-for="(item, i) in items" :key="i" :to="item.link" link>
            <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="transparent" elevate-on-scroll height="60px">
      <v-btn elevation="1" fab small style="z-index: 1" @click="drawer = !drawer">
        <v-icon>
          {{ drawer ? 'mdi-backburger' : 'mdi-menu-open' }}
        </v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-menu bottom min-width="170px" rounded offset-y>
        <template v-slot:activator="{ on }">
          <v-btn icon x-large v-on="on">
            <v-avatar color="#c4346c" size="40">
              <span class="white--text text-h6">{{ user.initials }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-list-item-content class="justify-center">
            <div class="mx-auto text-center">
              <v-avatar color="#c4346c">
                <span class="white--text text-h5">{{ user.initials }}</span>
              </v-avatar>
              <h4>{{ user.fullName }}</h4>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn depressed rounded text>
                Edit Account
              </v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn depressed rounded text>
                Log Out
              </v-btn>
            </div>
          </v-list-item-content>
        </v-card>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: null,
    items: [
      { title: 'Home', icon: 'mdi-home', link: '/' },
      { title: 'My patients', icon: 'mdi-account-search', link: '/all_patients' },
      { title: 'My records', icon: 'mdi-book-clock', link: '/my_records' },
      { title: 'About', icon: 'mdi-help-box', link: '/about' },
    ],
    user: {
      initials: 'JD',
      fullName: 'John Doe',
      email: 'john.doe@doe.com',
    },
  }),
}
</script>