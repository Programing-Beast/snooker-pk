<?php

namespace Database\Seeders;

use App\Models\Player;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Create roles
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'player']);
        Role::create(['name' => 'umpire']);

        // Admin user
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@snookerpk.com',
        ]);
        $admin->assignRole('admin');

        // Umpire user
        $umpire = User::factory()->create([
            'name' => 'Desislava Bozhilova',
            'email' => 'umpire@snookerpk.com',
        ]);
        $umpire->assignRole('umpire');

        // Sample players
        $players = [
            ['name' => 'M. Asif', 'city' => 'Faisalabad', 'tier' => 'pro', 'ranking_points' => 2500],
            ['name' => 'S. Khan', 'city' => 'Lahore', 'tier' => 'pro', 'ranking_points' => 2200],
            ['name' => 'B. Amin', 'city' => 'Karachi', 'tier' => 'pro', 'ranking_points' => 1900],
            ['name' => 'A. Sajjad', 'city' => 'Rawalpindi', 'tier' => 'pro', 'ranking_points' => 1800],
            ['name' => 'M. Bilal', 'city' => 'Islamabad', 'tier' => 'pro', 'ranking_points' => 1700],
            ['name' => 'H. Ali', 'city' => 'Multan', 'tier' => 'pro', 'ranking_points' => 1600],
            ['name' => 'K. Ayaz', 'city' => 'Peshawar', 'tier' => 'pro', 'ranking_points' => 1500],
            ['name' => 'Z. Abbas', 'city' => 'Quetta', 'tier' => 'pro', 'ranking_points' => 1400],
            ['name' => 'R. Ahmed', 'city' => 'Sialkot', 'tier' => 'pro', 'ranking_points' => 1350],
            ['name' => 'F. Aslam', 'city' => 'Gujranwala', 'tier' => 'pro', 'ranking_points' => 1300],
            ['name' => 'U. Hayat', 'city' => 'Hyderabad', 'tier' => 'pro', 'ranking_points' => 1250],
            ['name' => 'T. Rashid', 'city' => 'Bahawalpur', 'tier' => 'pro', 'ranking_points' => 1200],
            ['name' => 'W. Shah', 'city' => 'Faisalabad', 'tier' => 'pro', 'ranking_points' => 1150],
            ['name' => 'N. Iqbal', 'city' => 'Lahore', 'tier' => 'pro', 'ranking_points' => 1100],
            ['name' => 'I. Butt', 'city' => 'Karachi', 'tier' => 'pro', 'ranking_points' => 1050],
            ['name' => 'D. Farooq', 'city' => 'Rawalpindi', 'tier' => 'pro', 'ranking_points' => 1000],
            ['name' => 'O. Raza', 'city' => 'Islamabad', 'tier' => 'amateur', 'ranking_points' => 950],
            ['name' => 'J. Malik', 'city' => 'Multan', 'tier' => 'amateur', 'ranking_points' => 900],
            ['name' => 'G. Nasir', 'city' => 'Peshawar', 'tier' => 'amateur', 'ranking_points' => 850],
            ['name' => 'L. Zaman', 'city' => 'Quetta', 'tier' => 'amateur', 'ranking_points' => 800],
            ['name' => 'P. Younis', 'city' => 'Sialkot', 'tier' => 'amateur', 'ranking_points' => 750],
            ['name' => 'C. Anwar', 'city' => 'Gujranwala', 'tier' => 'amateur', 'ranking_points' => 700],
            ['name' => 'E. Rehman', 'city' => 'Hyderabad', 'tier' => 'amateur', 'ranking_points' => 650],
            ['name' => 'V. Saeed', 'city' => 'Bahawalpur', 'tier' => 'amateur', 'ranking_points' => 600],
            ['name' => 'Q. Tariq', 'city' => 'Sargodha', 'tier' => 'amateur', 'ranking_points' => 550],
            ['name' => 'X. Hameed', 'city' => 'Abbottabad', 'tier' => 'amateur', 'ranking_points' => 500],
            ['name' => 'Y. Akram', 'city' => 'Mardan', 'tier' => 'amateur', 'ranking_points' => 450],
            ['name' => 'M. Kamran', 'city' => 'Sukkur', 'tier' => 'amateur', 'ranking_points' => 400],
            ['name' => 'S. Wahab', 'city' => 'Sahiwal', 'tier' => 'amateur', 'ranking_points' => 350],
            ['name' => 'A. Latif', 'city' => 'Jhang', 'tier' => 'amateur', 'ranking_points' => 300],
            ['name' => 'R. Usman', 'city' => 'Okara', 'tier' => 'amateur', 'ranking_points' => 250],
            ['name' => 'F. Imran', 'city' => 'Wah Cantt', 'tier' => 'amateur', 'ranking_points' => 200],
        ];

        foreach ($players as $i => $data) {
            $user = User::factory()->create([
                'name' => $data['name'],
                'email' => strtolower(str_replace([' ', '.'], '', $data['name'])) . '@snookerpk.com',
            ]);
            $user->assignRole('player');

            $player = Player::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'country_code' => 'PAK',
                'city' => $data['city'],
                'tier' => $data['tier'],
                'ranking_points' => $data['ranking_points'],
            ]);

            $player->phones()->create([
                'phone' => '030' . $i . str_pad($i + 1, 7, '0', STR_PAD_LEFT),
                'label' => 'Primary',
            ]);
        }
    }
}
