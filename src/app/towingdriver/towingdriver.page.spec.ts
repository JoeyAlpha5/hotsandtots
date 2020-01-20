import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TowingdriverPage } from './towingdriver.page';

describe('TowingdriverPage', () => {
  let component: TowingdriverPage;
  let fixture: ComponentFixture<TowingdriverPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TowingdriverPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TowingdriverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
